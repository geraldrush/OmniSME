const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "sme_ecommerce",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "user-service" });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ============ AUTH ROUTES ============

// Sign Up - Create new user account + store
app.post("/auth/signup", async (req, res) => {
  const { email, password, name, businessName, businessRegistration } =
    req.body;

  // Validation
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Email, password, and name are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and store in transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Create user
      const userResult = await client.query(
        "INSERT INTO users (email, password_hash, full_name, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, full_name",
        [email, hashedPassword, name, "sme_owner"],
      );
      const userId = userResult.rows[0].id;

      // Create store
      const storeResult = await client.query(
        "INSERT INTO sme_stores (owner_id, store_name, business_registration_number, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, store_name",
        [userId, businessName || name, businessRegistration || ""],
      );
      const storeId = storeResult.rows[0].id;

      await client.query("COMMIT");

      // Generate JWT
      const token = jwt.sign(
        { userId, email, storeId, role: "sme_owner" },
        JWT_SECRET,
        { expiresIn: "30d" },
      );

      res.status(201).json({
        message: "Account created successfully",
        token,
        user: {
          id: userId,
          email,
          name,
          storeId,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user
    const result = await pool.query(
      "SELECT u.id, u.email, u.password_hash, u.full_name, u.role, s.id as store_id FROM users u LEFT JOIN sme_stores s ON u.id = s.owner_id WHERE u.email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        storeId: user.store_id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        storeId: user.store_id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Get current user profile
app.get("/auth/me", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, full_name, role, created_at FROM users WHERE id = $1",
      [req.user.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// ============ USER ROUTES ============

// Get user by ID
app.get("/users/:id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, full_name, role FROM users WHERE id = $1",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Update user profile
app.put("/users/:id", verifyToken, async (req, res) => {
  // Ensure user can only update their own profile
  if (req.user.userId !== req.params.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const { full_name, phone, address } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), address = COALESCE($3, address), updated_at = NOW() WHERE id = $4 RETURNING id, email, full_name",
      [full_name, phone, address, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated", user: result.rows[0] });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Change password
app.post("/auth/change-password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both passwords are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters" });
  }

  try {
    // Get current password hash
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash,
    );
    if (!passwordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, req.user.userId],
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`User Service listening on port ${PORT}`);
});

process.on("SIGTERM", () => server.close());
module.exports = app;
