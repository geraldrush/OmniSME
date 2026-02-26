const express = require("express");
const router = express.Router();

// GET /api/v1/orders
router.get("/", (req, res) => {
  res.status(200).json({
    orders: [],
    total: 0,
  });
});

// GET /api/v1/orders/:id
router.get("/:id", (req, res) => {
  res.status(200).json({
    order: {
      id: req.params.id,
      order_number: "ORD-001",
      total_amount: 299.99,
      order_status: "pending",
    },
  });
});

// POST /api/v1/orders
router.post("/", (req, res) => {
  res.status(201).json({
    message: "Order created successfully",
    order: {
      id: "temp-id",
      order_number: "ORD-001",
      ...req.body,
    },
  });
});

// PUT /api/v1/orders/:id (SME only)
router.put("/:id", (req, res) => {
  res.status(200).json({
    message: "Order updated successfully",
  });
});

module.exports = router;
