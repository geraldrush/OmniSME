const express = require("express");
const router = express.Router();

// GET /api/v1/products
router.get("/", (req, res) => {
  const { category_id, search, limit = 20, offset = 0 } = req.query;

  res.status(200).json({
    products: [],
    total: 0,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
});

// GET /api/v1/products/:id
router.get("/:id", (req, res) => {
  res.status(200).json({
    product: {
      id: req.params.id,
      product_name: "Sample Product",
      price: 99.99,
      currency: "ZAR",
    },
  });
});

// POST /api/v1/products (SME only)
router.post("/", (req, res) => {
  res.status(201).json({
    message: "Product created successfully",
    product: req.body,
  });
});

// PUT /api/v1/products/:id (SME only)
router.put("/:id", (req, res) => {
  res.status(200).json({
    message: "Product updated successfully",
    product: req.body,
  });
});

// DELETE /api/v1/products/:id (SME only)
router.delete("/:id", (req, res) => {
  res.status(200).json({
    message: "Product deleted successfully",
  });
});

module.exports = router;
