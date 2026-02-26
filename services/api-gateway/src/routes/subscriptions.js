const express = require("express");
const router = express.Router();

// GET /api/v1/subscriptions
router.get("/", (req, res) => {
  res.status(200).json({
    subscriptions: [],
  });
});

// GET /api/v1/subscriptions/plans
router.get("/plans", (req, res) => {
  res.status(200).json({
    plans: [
      {
        id: "1",
        plan_name: "Starter",
        monthly_price: 99.0,
        features: ["100 products", "1 user"],
      },
      {
        id: "2",
        plan_name: "Professional",
        monthly_price: 199.0,
        features: ["Unlimited products", "5 users"],
      },
    ],
  });
});

// POST /api/v1/subscriptions
router.post("/", (req, res) => {
  res.status(201).json({
    message: "Subscription created",
    subscription: req.body,
  });
});

module.exports = router;
