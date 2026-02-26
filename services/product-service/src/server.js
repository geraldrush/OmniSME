const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3002;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "sme_ecommerce",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

app.use(helmet());
app.use(cors());
app.use(express.json());

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "product-service" });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace("Bearer ", "") : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
  next();
};

app.use(verifyToken);

// ============ PRODUCT ROUTES ============

// Get all products with filtering
app.get("/products", async (req, res) => {
  try {
    const { category, search, store_id, page = 1, limit = 20 } = req.query;
    let query = "SELECT * FROM products WHERE deleted_at IS NULL";
    const params = [];
    let paramCount = 1;

    // Filter by category
    if (category) {
      query += ` AND category_id = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // Filter by store
    if (store_id) {
      query += ` AND store_id = $${paramCount}`;
      params.push(store_id);
      paramCount++;
    }

    // Search by name or description
    if (search) {
      query += ` AND (LOWER(name) LIKE LOWER($${paramCount}) OR LOWER(description) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Get product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT p.*, c.name as category_name, s.store_name FROM products p LEFT JOIN product_categories c ON p.category_id = c.id LEFT JOIN sme_stores s ON p.store_id = s.id WHERE p.id = $1 AND p.deleted_at IS NULL",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// Create product (SME owner only)
app.post("/products", async (req, res) => {
  if (!req.user || !req.user.storeId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const { name, description, category_id, price, stock, sku, images } =
    req.body;

  // Validation
  if (!name || !price || !stock === undefined) {
    return res
      .status(400)
      .json({ message: "Name, price, and stock are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products 
       (store_id, name, description, category_id, price, stock, sku, images, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       RETURNING *`,
      [
        req.user.storeId,
        name,
        description || null,
        category_id || null,
        parseFloat(price),
        parseInt(stock),
        sku || null,
        images ? JSON.stringify(images) : null,
      ],
    );

    res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// Update product (SME owner only)
app.put("/products/:id", async (req, res) => {
  if (!req.user || !req.user.storeId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const { name, description, category_id, price, stock, sku } = req.body;

  try {
    // Check ownership
    const product = await pool.query(
      "SELECT store_id FROM products WHERE id = $1",
      [req.params.id],
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      product.rows[0].store_id !== req.user.storeId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update product
    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category_id = COALESCE($3, category_id),
           price = COALESCE($4, price),
           stock = COALESCE($5, stock),
           sku = COALESCE($6, sku),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, category_id, price, stock, sku, req.params.id],
    );

    res.json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// Delete product (soft delete)
app.delete("/products/:id", async (req, res) => {
  if (!req.user || !req.user.storeId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    // Check ownership
    const product = await pool.query(
      "SELECT store_id FROM products WHERE id = $1",
      [req.params.id],
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      product.rows[0].store_id !== req.user.storeId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Soft delete
    await pool.query("UPDATE products SET deleted_at = NOW() WHERE id = $1", [
      req.params.id,
    ]);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// ============ CATEGORY ROUTES ============

// Get all categories
app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM product_categories WHERE deleted_at IS NULL ORDER BY name",
    );
    res.json({ categories: result.rows });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// Create category (admin only)
app.post("/categories", async (req, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO product_categories (name, description, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [name, description || null],
    );

    res.status(201).json({
      message: "Category created",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Product Service listening on port ${PORT}`);
});

process.on("SIGTERM", () => server.close());
module.exports = app;
