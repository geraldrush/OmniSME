const express = require("express");
const router = express.Router();

// GET /api/v1/stores/:slug
router.get("/:slug", (req, res) => {
  res.status(200).json({
    store: {
      id: "temp-id",
      store_name: "Sample Store",
      store_slug: req.params.slug,
      is_active: true,
    },
  });
});

// POST /api/v1/stores (SME signup)
router.post("/", (req, res) => {
  res.status(201).json({
    message: "Store created successfully",
    store: {
      id: "temp-id",
      ...req.body,
    },
  });
});

module.exports = router;
