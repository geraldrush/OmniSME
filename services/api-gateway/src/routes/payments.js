const express = require("express");
const router = express.Router();

// POST /api/v1/payments
router.post("/", (req, res) => {
  const { order_id, payment_gateway, amount } = req.body;

  res.status(201).json({
    message: "Payment initiated",
    payment: {
      id: "temp-payment-id",
      order_id,
      payment_gateway,
      amount,
      payment_status: "pending",
    },
  });
});

// GET /api/v1/payments/:id
router.get("/:id", (req, res) => {
  res.status(200).json({
    payment: {
      id: req.params.id,
      payment_status: "pending",
    },
  });
});

// Webhook for PayFast ITN
router.post("/payfast/notify", (req, res) => {
  // Verify ITN signature
  // Update payment status
  res.status(200).json({ status: "ok" });
});

// Webhook for Ozow
router.post("/ozow/webhook", (req, res) => {
  // Process webhook
  res.status(200).json({ status: "ok" });
});

module.exports = router;
