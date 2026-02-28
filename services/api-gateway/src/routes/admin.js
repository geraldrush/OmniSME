const express = require("express");
const axios = require("axios");
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

const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

router.get("/overview", async (req, res) => {
  try {
    const [stores, users, orders, payments, revenue, statusBreakdown, recentOrders] =
      await Promise.all([
        pool.query("SELECT COUNT(*)::int AS total FROM sme_stores WHERE deleted_at IS NULL"),
        pool.query("SELECT COUNT(*)::int AS total FROM users WHERE deleted_at IS NULL"),
        pool.query("SELECT COUNT(*)::int AS total FROM orders"),
        pool.query("SELECT COUNT(*)::int AS total FROM payments"),
        pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders"),
        pool.query(
          "SELECT order_status, COUNT(*)::int AS total FROM orders GROUP BY order_status",
        ),
        pool.query(
          `SELECT o.id, o.order_number, o.customer_name, o.total_amount, o.order_status, o.created_at, s.store_name
           FROM orders o
           LEFT JOIN sme_stores s ON o.tenant_id = s.id
           ORDER BY o.created_at DESC
           LIMIT 10`,
        ),
      ]);

    return res.status(200).json({
      overview: {
        merchants: stores.rows[0]?.total || 0,
        users: users.rows[0]?.total || 0,
        orders: orders.rows[0]?.total || 0,
        payments: payments.rows[0]?.total || 0,
        revenue: safeNumber(revenue.rows[0]?.total, 0),
        order_status_breakdown: statusBreakdown.rows,
      },
      recent_orders: recentOrders.rows,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/merchants", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        s.id,
        s.store_name,
        s.store_slug,
        s.is_active,
        s.created_at,
        COUNT(DISTINCT o.id)::int AS orders_count,
        COALESCE(SUM(o.total_amount), 0) AS revenue,
        COUNT(DISTINCT p.id)::int AS products_count
      FROM sme_stores s
      LEFT JOIN orders o ON o.tenant_id = s.id
      LEFT JOIN products p ON p.tenant_id = s.id AND p.deleted_at IS NULL
      WHERE s.deleted_at IS NULL
      GROUP BY s.id
      ORDER BY s.created_at DESC`,
    );

    return res.status(200).json({ merchants: result.rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/system", async (req, res) => {
  const services = [
    { name: "api-gateway", url: "http://localhost:3000/health" },
    { name: "user-service", url: "http://user-service:3001/health" },
    { name: "product-service", url: "http://product-service:3002/health" },
    { name: "order-service", url: "http://order-service:3003/health" },
    { name: "payment-service", url: "http://payment-service:3004/health" },
    { name: "shipping-service", url: "http://shipping-service:3005/health" },
    { name: "subscription-service", url: "http://subscription-service:3006/health" },
  ];

  try {
    const checks = await Promise.all(
      services.map(async (service) => {
        try {
          const response = await axios.get(service.url, { timeout: 2000 });
          return {
            service: service.name,
            status: response.status === 200 ? "up" : "degraded",
          };
        } catch (error) {
          return {
            service: service.name,
            status: "down",
          };
        }
      }),
    );

    return res.status(200).json({ services: checks });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
