const express = require("express");
const router = express.Router();

// POST /api/v1/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, full_name, user_type } = req.body;

    // Validate input
    if (!email || !password || !full_name) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Call user-service via HTTP
    // For now, return a placeholder
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: "temp-id",
        email,
        full_name,
        user_type: user_type || "customer",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
      });
    }

    // Call user-service via HTTP
    res.status(200).json({
      message: "Login successful",
      token: "placeholder-jwt-token",
      user: {
        id: "temp-id",
        email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/auth/logout
router.post("/logout", (req, res) => {
  res.status(200).json({
    message: "Logged out successfully",
  });
});

// POST /api/v1/auth/refresh
router.post("/refresh", (req, res) => {
  res.status(200).json({
    token: "new-jwt-token",
  });
});

module.exports = router;
