const express = require("express");
const axios = require("axios");
const router = express.Router();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

const USER_SERVICE_CANDIDATES = [
  USER_SERVICE_URL,
  "http://user-service:3001",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
].filter(Boolean);

const requestUserService = async (method, path, payload) => {
  let lastError = null;

  for (const baseUrl of USER_SERVICE_CANDIDATES) {
    try {
      const response = await axios({
        method,
        url: `${baseUrl}${path}`,
        data: payload,
        timeout: 8000,
      });
      return response;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("User service is not reachable");
};

const fetchStoreById = async (storeId) => {
  if (!storeId) {
    return null;
  }
  try {
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      host: process.env.DB_HOST || "postgres",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "sme_ecommerce",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
    });
    const result = await pool.query(
      "SELECT id, store_name, store_slug FROM sme_stores WHERE id = $1 LIMIT 1",
      [storeId],
    );
    await pool.end();
    return result.rows[0] || null;
  } catch (error) {
    return null;
  }
};

// POST /api/v1/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      name,
      user_type,
      businessName,
      businessRegistration,
    } = req.body;
    const resolvedName = full_name || name;
    const accountType = user_type || "customer";

    // Validate input
    if (!email || !password || !resolvedName) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const signupResponse = await requestUserService("post", "/auth/signup", {
      email,
      password,
      name: resolvedName,
      full_name: resolvedName,
      user_type: accountType,
      businessName,
      businessRegistration,
    });

    const payload = signupResponse.data || {};
    let store = null;
    if (accountType === "sme_owner" && payload.user?.storeId) {
      const fetched = await fetchStoreById(payload.user.storeId);
      if (fetched) {
        store = {
          id: fetched.id,
          store_name: fetched.store_name,
          store_slug: fetched.store_slug,
          shop_url: `/shop/${fetched.store_slug}`,
        };
      }
    }

    res.status(signupResponse.status || 201).json({
      ...payload,
      store,
      links:
        store && store.store_slug
          ? {
              shop: `/shop/${store.store_slug}`,
            }
          : null,
      user: {
        ...payload.user,
        user_type: payload.user?.user_type || accountType,
      },
    });
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message,
    });
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

    const loginResponse = await requestUserService("post", "/auth/login", {
      email,
      password,
    });

    const payload = loginResponse.data || {};
    let store = null;
    if (payload.user?.storeId) {
      const fetched = await fetchStoreById(payload.user.storeId);
      if (fetched) {
        store = {
          id: fetched.id,
          store_name: fetched.store_name,
          store_slug: fetched.store_slug,
          shop_url: `/shop/${fetched.store_slug}`,
        };
      }
    }

    res.status(loginResponse.status || 200).json({
      ...payload,
      store,
      links:
        store && store.store_slug
          ? {
              shop: `/shop/${store.store_slug}`,
            }
          : null,
    });
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message,
    });
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
