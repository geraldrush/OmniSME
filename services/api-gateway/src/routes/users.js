const express = require("express");
const router = express.Router();

// GET /api/v1/users/:id
router.get("/:id", (req, res) => {
  res.status(200).json({
    user: {
      id: req.params.id,
      email: "user@example.com",
      full_name: "John Doe",
      created_at: new Date().toISOString(),
    },
  });
});

// PUT /api/v1/users/:id
router.put("/:id", (req, res) => {
  res.status(200).json({
    message: "User updated successfully",
    user: req.body,
  });
});

// GET /api/v1/users/:id/profile
router.get("/:id/profile", (req, res) => {
  res.status(200).json({
    profile: {
      id: req.params.id,
      avatar_url: null,
      phone: null,
      updated_at: new Date().toISOString(),
    },
  });
});

module.exports = router;
