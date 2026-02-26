const express = require("express");
const router = express.Router();

// GET /api/v1/categories
router.get("/", (req, res) => {
  res.status(200).json({
    categories: [],
  });
});

// GET /api/v1/categories/:id
router.get("/:id", (req, res) => {
  res.status(200).json({
    category: {
      id: req.params.id,
      name: "Category Name",
    },
  });
});

// POST /api/v1/categories (SME only)
router.post("/", (req, res) => {
  res.status(201).json({
    message: "Category created successfully",
    category: req.body,
  });
});

module.exports = router;
