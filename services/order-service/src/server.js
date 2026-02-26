const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3003;

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
  res.status(200).json({ status: "ok", service: "order-service" });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace("Bearer ", "") : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ============ ORDER ROUTES ============

// Get orders (customer sees their orders, SME sees orders for their store)
app.get("/orders", verifyToken, async (req, res) => {
  try {
    let query = "SELECT * FROM orders WHERE deleted_at IS NULL";
    const params = [];
    let paramCount = 1;

    // If SME owner, show orders for their store
    if (req.user.role === "sme_owner") {
      query += ` AND store_id = $${paramCount}`;
      params.push(req.user.storeId);
      paramCount++;
    } else {
      // If customer, show their orders
      query += ` AND user_id = $${paramCount}`;
      params.push(req.user.userId);
      paramCount++;
    }

    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);

    res.json({ orders: result.rows });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get order by ID
app.get("/orders/:id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.full_name, u.email, s.store_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN sme_stores s ON o.store_id = s.id
       WHERE o.id = $1 AND o.deleted_at IS NULL`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = result.rows[0];

    // Check authorization (customer can see their own, SME can see their store's)
    if (
      req.user.role !== "admin" &&
      order.user_id !== req.user.userId &&
      order.store_id !== req.user.storeId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.*, p.name, p.price FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [req.params.id],
    );

    res.json({
      order: {
        ...order,
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// Create order
app.post("/orders", verifyToken, async (req, res) => {
  const { items, shippingAddress, storeId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Order must contain items" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get first item's store if not specified
    const targetStoreId = storeId || items[0].store_id;

    // Calculate total
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders 
       (user_id, store_id, total, status, shipping_address, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [req.user.userId, targetStoreId, total, "pending", shippingAddress || ""],
    );

    const orderId = orderResult.rows[0].id;

    // Add order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [orderId, item.id, item.quantity, item.price],
      );

      // Update product stock
      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [item.quantity, item.id],
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created successfully",
      order: orderResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  } finally {
    client.release();
  }
});

// Update order status (SME owner only)
app.put("/orders/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    // Check ownership
    const order = await pool.query(
      "SELECT store_id FROM orders WHERE id = $1",
      [req.params.id],
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role !== "admin" &&
      order.rows[0].store_id !== req.user.storeId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update status
    const result = await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id],
    );

    res.json({
      message: "Order status updated",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
});

// Cancel order
app.post("/orders/:id/cancel", verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check ownership and status
    const order = await client.query("SELECT * FROM orders WHERE id = $1", [
      req.params.id,
    ]);

    if (order.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData = order.rows[0];

    if (req.user.role !== "admin" && orderData.user_id !== req.user.userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!["pending", "confirmed"].includes(orderData.status)) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Cannot cancel order in current status" });
    }

    // Update status to cancelled
    await client.query(
      "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2",
      ["cancelled", req.params.id],
    );

    // Restore product stock
    const items = await client.query(
      "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
      [req.params.id],
    );

    for (const item of items.rows) {
      await client.query(
        "UPDATE products SET stock = stock + $1 WHERE id = $2",
        [item.quantity, item.product_id],
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  } finally {
    client.release();
  }
});

const server = app.listen(PORT, () => {
  console.log(`Order Service listening on port ${PORT}`);
});

process.on("SIGTERM", () => server.close());
module.exports = app;
