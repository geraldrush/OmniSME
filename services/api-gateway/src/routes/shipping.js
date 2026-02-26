const express = require("express");
const router = express.Router();

// GET /api/v1/shipping/quote
router.post("/quote", (req, res) => {
  const { to_address, weight_kg, dimensions } = req.body;

  res.status(200).json({
    quotes: [
      {
        carrier: "courier_guy",
        cost: 50.0,
        estimated_days: 2,
      },
      {
        carrier: "bob_go",
        cost: 45.0,
        estimated_days: 3,
      },
    ],
  });
});

// POST /api/v1/shipping/book
router.post("/book", (req, res) => {
  res.status(201).json({
    message: "Shipping label created",
    label: {
      id: "temp-label-id",
      tracking_number: "TRK123456",
      carrier: req.body.carrier,
    },
  });
});

// GET /api/v1/shipping/track/:reference
router.get("/track/:reference", (req, res) => {
  res.status(200).json({
    tracking: {
      reference: req.params.reference,
      status: "in_transit",
      last_update: new Date().toISOString(),
    },
  });
});

module.exports = router;
