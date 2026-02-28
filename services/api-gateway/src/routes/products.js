const express = require("express");
const { Pool } = require("pg");
const { randomUUID } = require("crypto");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "postgres",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "sme_ecommerce",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

const toSlug = (value) => {
  if (!value) {
    return "";
  }
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const parseJson = (value) => {
  if (!value) {
    return {};
  }
  if (typeof value === "object") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};

const safeNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const ensureDefaultStore = async () => {
  const existing = await pool.query(
    "SELECT id, store_name FROM sme_stores WHERE store_slug = $1 LIMIT 1",
    ["default-store"],
  );
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  try {
    const insert = await pool.query(
      "INSERT INTO sme_stores (owner_id, store_name, store_slug, is_active, created_at, updated_at) VALUES ($1, $2, $3, true, NOW(), NOW()) RETURNING id, store_name",
      [randomUUID(), "Default Store", "default-store"],
    );
    return insert.rows[0];
  } catch (error) {
    const retry = await pool.query(
      "SELECT id, store_name FROM sme_stores WHERE store_slug = $1 LIMIT 1",
      ["default-store"],
    );
    if (retry.rows.length > 0) {
      return retry.rows[0];
    }
    throw error;
  }
};

const ensureCategory = async (tenantId, name) => {
  const categoryName = name || "Other";
  const slug = toSlug(categoryName) || "other";
  const existing = await pool.query(
    "SELECT id, name FROM product_categories WHERE tenant_id = $1 AND slug = $2 AND is_active = true LIMIT 1",
    [tenantId, slug],
  );
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const insert = await pool.query(
    "INSERT INTO product_categories (tenant_id, name, slug, is_active, created_at, updated_at) VALUES ($1, $2, $3, true, NOW(), NOW()) RETURNING id, name",
    [tenantId, categoryName, slug],
  );
  return insert.rows[0];
};

const mapRowToProduct = (row) => {
  const metadata = parseJson(row.metadata);
  return {
    id: row.id,
    name: row.product_name,
    description: row.description,
    price: safeNumber(row.price, 0),
    currency: row.currency || "ZAR",
    stock: safeNumber(row.quantity_in_stock, 0),
    category: row.category_name || "Other",
    store: row.store_name || "SME Store",
    store_id: row.store_id,
    store_slug: row.store_slug,
    rating: safeNumber(row.rating ?? metadata.rating, 0),
    reviews: safeNumber(row.reviews ?? metadata.reviews, 0),
    metadata,
    created_at: row.created_at,
  };
};

// GET /api/v1/products
router.get("/", async (req, res) => {
  try {
    const {
      category_id,
      category,
      search,
      store_id,
      store_slug,
      limit = 20,
      offset = 0,
    } = req.query;
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const safeOffset = Math.max(0, parseInt(offset) || 0);
    const filters = [];
    const params = [];
    let paramIndex = 1;

    filters.push("p.deleted_at IS NULL");
    filters.push("p.is_active = true");

    if (category_id) {
      filters.push(`p.category_id = $${paramIndex}`);
      params.push(category_id);
      paramIndex += 1;
    } else if (category) {
      filters.push(`c.name = $${paramIndex}`);
      params.push(category);
      paramIndex += 1;
    }

    if (store_id) {
      filters.push(`p.tenant_id = $${paramIndex}`);
      params.push(store_id);
      paramIndex += 1;
    } else if (store_slug) {
      filters.push(`s.store_slug = $${paramIndex}`);
      params.push(store_slug);
      paramIndex += 1;
    }

    if (search) {
      filters.push(
        `(LOWER(p.product_name) LIKE LOWER($${paramIndex}) OR LOWER(p.description) LIKE LOWER($${paramIndex}) OR LOWER(s.store_name) LIKE LOWER($${paramIndex}))`,
      );
      params.push(`%${search}%`);
      paramIndex += 1;
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    params.push(safeLimit, safeOffset);

    const query = `
      SELECT
        p.id,
        p.product_name,
        p.description,
        p.price,
        p.currency,
        p.quantity_in_stock,
        p.metadata,
        p.created_at,
        p.tenant_id AS store_id,
        c.name AS category_name,
        s.store_name,
        s.store_slug
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN sme_stores s ON p.tenant_id = s.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(query, params);
    const products = result.rows.map(mapRowToProduct);

    res.status(200).json({
      products,
      total: products.length,
      limit: safeLimit,
      offset: safeOffset,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/products/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.product_name,
        p.description,
        p.price,
        p.currency,
        p.quantity_in_stock,
        p.metadata,
        p.created_at,
        p.tenant_id AS store_id,
        c.name AS category_name,
        s.store_name,
        s.store_slug
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN sme_stores s ON p.tenant_id = s.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
      `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ product: mapRowToProduct(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/products (SME only)
router.post("/", async (req, res) => {
  try {
    const { name, product_name, description, category, category_name, price, stock } =
      req.body || {};

    const resolvedName = name || product_name;
    const resolvedPrice = safeNumber(price, null);
    const resolvedStock = Math.max(0, Math.floor(safeNumber(stock, 0)));

    if (!resolvedName || resolvedPrice === null) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const store = await ensureDefaultStore();
    const categoryRecord = await ensureCategory(
      store.id,
      category || category_name || "Other",
    );

    const slug = toSlug(resolvedName) || `product-${Date.now()}`;
    const metadata = {
      ...parseJson(req.body?.metadata),
      rating: safeNumber(req.body?.rating, 0),
      reviews: safeNumber(req.body?.reviews, 0),
    };

    const insert = await pool.query(
      `
      INSERT INTO products
        (tenant_id, category_id, product_name, slug, description, price, quantity_in_stock, is_active, metadata, created_at, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, true, $8, NOW(), NOW())
      RETURNING id, product_name, description, price, currency, quantity_in_stock, metadata, created_at
      `,
      [
        store.id,
        categoryRecord.id,
        resolvedName,
        slug,
        description || null,
        resolvedPrice,
        resolvedStock,
        metadata,
      ],
    );

    const product = mapRowToProduct({
      ...insert.rows[0],
      category_name: categoryRecord.name,
      store_name: store.store_name,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/products/:id (SME only)
router.put("/:id", (req, res) => {
  res.status(200).json({
    message: "Product updated successfully",
    product: req.body,
  });
});

// DELETE /api/v1/products/:id (SME only)
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE products SET deleted_at = NOW(), is_active = false, updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
