const express = require("express");
const router = express.Router();

const normalizeMethod = (value) =>
  String(value || "payfast")
    .toLowerCase()
    .trim();

const formatCurrency = (value) => Number(value || 0).toFixed(2);

const buildWhatsAppMessage = ({ orderId, amount, customerName }) => {
  const text = [
    "Hi, I want to place an order.",
    `Order: ${orderId}`,
    `Amount: R${formatCurrency(amount)}`,
    customerName ? `Name: ${customerName}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  return encodeURIComponent(text);
};

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

// POST /api/v1/payments/initiate
router.post("/initiate", (req, res) => {
  const {
    orderId,
    amount,
    method,
    customerName,
    whatsappNumber,
    bankDetails,
  } = req.body || {};

  if (!orderId || !amount) {
    return res.status(400).json({
      message: "orderId and amount are required",
    });
  }

  const selectedMethod = normalizeMethod(method);
  const payment = {
    id: `pay-${Date.now()}`,
    order_id: orderId,
    amount: Number(amount),
    payment_status: "pending",
    method: selectedMethod,
  };

  if (selectedMethod === "payfast") {
    const merchantId = process.env.PAYFAST_MERCHANT_ID || "test";
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY || "test";
    const payfastUrl = `https://sandbox.payfast.co.za/eng/process?${new URLSearchParams({
      merchant_id: merchantId,
      merchant_key: merchantKey,
      amount: formatCurrency(amount),
      item_name: `SME Order ${orderId}`,
      m_payment_id: orderId,
    }).toString()}`;

    return res.status(200).json({
      message: "PayFast payment initiated",
      payment,
      action: {
        type: "redirect",
        url: payfastUrl,
      },
    });
  }

  if (selectedMethod === "bank_transfer") {
    return res.status(200).json({
      message: "Bank transfer instructions generated",
      payment,
      action: {
        type: "instructions",
        bank_details:
          bankDetails ||
          "Bank: Demo Bank | Account: 1234567890 | Branch: 000000 | Ref: Order " +
            orderId,
      },
    });
  }

  if (selectedMethod === "whatsapp") {
    if (!whatsappNumber) {
      return res.status(400).json({
        message: "whatsappNumber is required for WhatsApp orders",
      });
    }

    const cleaned = String(whatsappNumber).replace(/[^\d]/g, "");
    const message = buildWhatsAppMessage({ orderId, amount, customerName });
    const whatsappUrl = `https://wa.me/${cleaned}?text=${message}`;

    return res.status(200).json({
      message: "WhatsApp order link created",
      payment,
      action: {
        type: "redirect",
        url: whatsappUrl,
      },
    });
  }

  return res.status(400).json({
    message: "Unsupported payment method",
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
