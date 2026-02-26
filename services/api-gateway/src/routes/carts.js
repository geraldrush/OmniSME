const express = require("express");
const router = express.Router();

// GET /api/v1/carts/:id
router.get("/:id", (req, res) => {
  res.status(200).json({
    cart: {
      id: req.params.id,
      items: [],
      total: 0,
    },
  });
});

// POST /api/v1/carts
router.post("/", (req, res) => {
  res.status(201).json({
    cart: {
      id: "temp-id",
      items: [],
      total: 0,
    },
  });
});

// POST /api/v1/carts/:id/items
router.post("/:id/items", (req, res) => {
  res.status(201).json({
    message: "Item added to cart",
    cart: req.body,
  });
});

// DELETE /api/v1/carts/:id/items/:itemId
router.delete("/:id/items/:itemId", (req, res) => {
  res.status(200).json({
    message: "Item removed from cart",
  });
});

module.exports = router;
