const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "postgres",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "sme_ecommerce",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

const normalizeStatus = (value) => {
  const allowed = new Set(["pending", "confirmed", "shipped", "delivered"]);
  const normalized = String(value || "pending").toLowerCase();
  return allowed.has(normalized) ? normalized : "pending";
};

const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapOrder = (row) => ({
  id: row.id,
  order_number: row.order_number,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  status: row.order_status,
  payment_status: row.payment_status,
  total: safeNumber(row.total_amount, 0),
  subtotal: safeNumber(row.subtotal, 0),
  shipping_cost: safeNumber(row.shipping_cost, 0),
  payment_method: row.payment_method,
  created_at: row.created_at,
});

const resolveTenantId = async (items = []) => {
  const firstItem = items.find((item) => item?.store_id || item?.tenant_id);
  if (firstItem?.store_id || firstItem?.tenant_id) {
    return firstItem.store_id || firstItem.tenant_id;
  }

  const fallback = await pool.query(
    "SELECT id FROM sme_stores ORDER BY created_at ASC LIMIT 1",
  );
  return fallback.rows[0]?.id || null;
};

const fetchOrders = async ({ id, tenantId, limit = 100 }) => {
  const params = [];
  const filters = [];
  let index = 1;

  if (id) {
    filters.push(`id = $${index}`);
    params.push(id);
    index += 1;
  }

  if (tenantId) {
    filters.push(`tenant_id = $${index}`);
    params.push(tenantId);
    index += 1;
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  params.push(limit);

  const result = await pool.query(
    `SELECT
      id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      order_status,
      payment_status,
      subtotal,
      shipping_cost,
      total_amount,
      payment_method,
      created_at
    FROM orders
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${index}`,
    params,
  );

  return result.rows.map(mapOrder);
};

// GET /api/v1/orders
router.get("/", async (req, res) => {
  try {
    const orders = await fetchOrders({ tenantId: req.query?.tenant_id || null });
    return res.status(200).json({ orders, total: orders.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/orders/:id
router.get("/:id", async (req, res) => {
  try {
    const orders = await fetchOrders({ id: req.params.id, limit: 1 });
    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).json({ order: orders[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/orders
router.post("/", async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (items.length === 0) {
    return res.status(400).json({ error: "Order items are required" });
  }

  try {
    const tenantId = await resolveTenantId(items);
    if (!tenantId) {
      return res.status(400).json({ error: "No store available for order" });
    }

    const subtotal = items.reduce(
      (sum, item) =>
        sum + safeNumber(item?.price, 0) * safeNumber(item?.quantity, 0),
      0,
    );
    const shippingCost = 50;
    const totalAmount = subtotal + shippingCost;
    const randomPart = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    const orderNumber = `ORD-${Date.now()}-${randomPart}`;

    const customerName = req.body?.customerName || "Guest";
    const customerEmail = req.body?.customerEmail || req.body?.email || "guest@example.com";
    const customerPhone = req.body?.customerPhone || req.body?.phone || "";
    const shippingAddress = req.body?.shippingAddress || "Unknown address";

    const insert = await pool.query(
      `INSERT INTO orders (
        tenant_id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        billing_address_line1,
        billing_city,
        billing_postal_code,
        shipping_address_line1,
        shipping_city,
        shipping_postal_code,
        subtotal,
        shipping_cost,
        total_amount,
        order_status,
        payment_status,
        payment_method,
        metadata,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17, $18,
        NOW(), NOW()
      )
      RETURNING id`,
      [
        tenantId,
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        "N/A",
        "0000",
        shippingAddress,
        "N/A",
        "0000",
        subtotal,
        shippingCost,
        totalAmount,
        "pending",
        "pending",
        req.body?.payment_method || null,
        JSON.stringify({ items }),
      ],
    );

    const orderId = insert.rows[0].id;

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          orderId,
          item.id,
          item.name || "Product",
          Math.max(1, Math.floor(safeNumber(item.quantity, 1))),
          safeNumber(item.price, 0),
          safeNumber(item.price, 0) * Math.max(1, Math.floor(safeNumber(item.quantity, 1))),
        ],
      );
    }

    const orders = await fetchOrders({ id: orderId, limit: 1 });
    return res.status(201).json({
      message: "Order created successfully",
      order: orders[0],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/orders/:id/status
router.put("/:id/status", async (req, res) => {
  try {
    const nextStatus = normalizeStatus(req.body?.status);
    const update = await pool.query(
      "UPDATE orders SET order_status = $1, updated_at = NOW() WHERE id = $2 RETURNING id",
      [nextStatus, req.params.id],
    );

    if (update.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orders = await fetchOrders({ id: req.params.id, limit: 1 });
    return res.status(200).json({
      message: "Order status updated",
      order: orders[0],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
