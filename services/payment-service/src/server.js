const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3004;

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
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || "test";
const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "test";
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || "test";

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "payment-service" });
});

// Verify JWT
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

// ============ PAYMENT ROUTES ============

// Get payment status
app.get("/payments/:orderId", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM payments WHERE order_id = $1",
      [req.params.orderId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ payment: result.rows[0] });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ message: "Failed to fetch payment" });
  }
});

// Initiate payment with PayFast
app.post("/payments/initiate", verifyToken, async (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res
      .status(400)
      .json({ message: "Order ID and amount are required" });
  }

  try {
    // Store payment record in database
    const result = await pool.query(
      `INSERT INTO payments (order_id, merchant_id, amount, status, method, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [orderId, PAYFAST_MERCHANT_ID, amount, "pending", "payfast"],
    );

    const payment = result.rows[0];

    // Build PayFast redirect URL
    const paymentData = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: `${process.env.FRONTEND_URL || "http://localhost:3100"}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3100"}/payment-cancel`,
      notify_url: `${process.env.API_URL || "http://localhost:3000"}/api/v1/payments/payfast/notify`,
      name_first: req.body.customerName?.split(" ")[0] || "Customer",
      name_last: req.body.customerName?.split(" ")?.[1] || "Name",
      email_address: req.body.email || "customer@example.com",
      m_payment_id: orderId,
      amount: parseFloat(amount).toFixed(2),
      item_name: "SME Store Order",
      item_description: `Order #${orderId}`,
    };

    // Generate signature
    const signature = generatePayFastSignature(paymentData);
    paymentData.signature = signature;

    res.json({
      message: "Payment initiated",
      payment,
      paymentUrl: `https://www.payfast.co.za/eng/process?${new URLSearchParams(paymentData).toString()}`,
      testUrl: `https://sandbox.payfast.co.za/eng/process?${new URLSearchParams(paymentData).toString()}`,
    });
  } catch (error) {
    console.error("Initiate payment error:", error);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
});

// PayFast ITN Webhook Handler
app.post("/payments/payfast/notify", async (req, res) => {
  try {
    // Verify signature
    const signature = req.body.signature;
    const payFastData = { ...req.body };
    delete payFastData.signature;

    const expectedSignature = generatePayFastSignature(payFastData);

    if (signature !== expectedSignature) {
      console.error("Invalid PayFast signature");
      return res.status(401).json({ message: "Invalid signature" });
    }

    const { m_payment_id, payment_status, amount_gross, transaction_id } =
      req.body;

    // Update payment record
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const paymentStatus =
        payment_status === "COMPLETE" ? "completed" : "failed";

      await client.query(
        `UPDATE payments 
         SET status = $1, transaction_id = $2, webhook_data = $3, updated_at = NOW()
         WHERE order_id = $4`,
        [paymentStatus, transaction_id, JSON.stringify(req.body), m_payment_id],
      );

      // If payment successful, mark order as confirmed
      if (payment_status === "COMPLETE") {
        await client.query(
          "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2",
          ["confirmed", m_payment_id],
        );
      }

      await client.query("COMMIT");
      res.status(200).json({ message: "Webhook processed" });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("PayFast webhook error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

// Ozow webhook
app.post("/payments/ozow/webhook", async (req, res) => {
  try {
    const { reference, status, amount, transactionId } = req.body;

    // Update payment record
    const paymentStatus = status === "COMPLETED" ? "completed" : "failed";

    await pool.query(
      `UPDATE payments 
       SET status = $1, transaction_id = $2, webhook_data = $3, updated_at = NOW()
       WHERE order_id = $4`,
      [paymentStatus, transactionId, JSON.stringify(req.body), reference],
    );

    // If payment successful, mark order as confirmed
    if (status === "COMPLETED") {
      await pool.query(
        "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2",
        ["confirmed", reference],
      );
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Ozow webhook error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

// ============ HELPER FUNCTIONS ============

function generatePayFastSignature(data) {
  // Build signature string from PayFast data
  let signatureString = "";
  const orderedKeys = Object.keys(data).sort();

  for (const key of orderedKeys) {
    if (data[key] && key !== "signature" && data[key] !== "") {
      signatureString += `${key}=${encodeURIComponent(data[key])}&`;
    }
  }

  // Add passphrase
  signatureString += `passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}`;

  // Generate MD5 hash
  return crypto.createHash("md5").update(signatureString).digest("hex");
}

const server = app.listen(PORT, () => {
  console.log(`Payment Service listening on port ${PORT}`);
});

process.on("SIGTERM", () => server.close());
module.exports = app;

const server = app.listen(PORT, () => {
  console.log(`Payment Service listening on port ${PORT}`);
});

process.on("SIGTERM", () => server.close());
module.exports = app;
