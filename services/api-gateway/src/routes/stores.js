const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "postgres",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "sme_ecommerce",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

const parseJson = (value) => {
  if (!value) {
    return {};
  }
  if (typeof value === "object") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};

const mapStore = (row) => {
  const settings = parseJson(row.settings);
  return {
    id: row.id,
    store_name: row.store_name,
    store_slug: row.store_slug,
    logo_url: row.logo_url || "",
    banner_url: row.banner_url || "",
    is_active: row.is_active,
    payment_methods: Array.isArray(settings.payment_methods)
      ? settings.payment_methods
      : [],
    whatsapp_number: settings.whatsapp_number || "",
    bank_details: settings.bank_details || null,
    settings,
  };
};

// GET /api/v1/stores?ids=uuid1,uuid2
router.get("/", async (req, res) => {
  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ error: "ids query param is required" });
  }

  const idList = String(ids)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (idList.length === 0) {
    return res.status(400).json({ error: "ids query param is required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, store_name, store_slug, logo_url, banner_url, is_active, settings FROM sme_stores WHERE id = ANY($1::uuid[])",
      [idList],
    );

    return res.status(200).json({
      stores: result.rows.map(mapStore),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/stores/by-slug/:slug
router.get("/by-slug/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, store_name, store_slug, logo_url, banner_url, is_active, settings FROM sme_stores WHERE store_slug = $1 LIMIT 1",
      [req.params.slug],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    return res.status(200).json({ store: mapStore(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/stores/by-id/:id
router.get("/by-id/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, store_name, store_slug, logo_url, banner_url, is_active, settings FROM sme_stores WHERE id = $1 LIMIT 1",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    return res.status(200).json({ store: mapStore(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/stores/:id/settings
router.patch("/:id/settings", async (req, res) => {
  const { payment_methods, whatsapp_number, bank_details } = req.body || {};
  const nextSettings = {
    payment_methods: Array.isArray(payment_methods)
      ? payment_methods.filter((value) =>
          ["whatsapp", "payfast", "bank_transfer"].includes(
            String(value).toLowerCase(),
          ),
        )
      : undefined,
    whatsapp_number:
      typeof whatsapp_number === "string" ? whatsapp_number.trim() : undefined,
    bank_details:
      typeof bank_details === "string" ? bank_details.trim() : undefined,
  };

  try {
    const current = await pool.query(
      "SELECT id, settings FROM sme_stores WHERE id = $1 LIMIT 1",
      [req.params.id],
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    const existingSettings = parseJson(current.rows[0].settings);
    const merged = {
      ...existingSettings,
      ...(nextSettings.payment_methods !== undefined
        ? { payment_methods: nextSettings.payment_methods }
        : {}),
      ...(nextSettings.whatsapp_number !== undefined
        ? { whatsapp_number: nextSettings.whatsapp_number }
        : {}),
      ...(nextSettings.bank_details !== undefined
        ? { bank_details: nextSettings.bank_details }
        : {}),
    };

    await pool.query(
      "UPDATE sme_stores SET settings = $1, updated_at = NOW() WHERE id = $2",
      [JSON.stringify(merged), req.params.id],
    );

    const updated = await pool.query(
      "SELECT id, store_name, store_slug, logo_url, banner_url, is_active, settings FROM sme_stores WHERE id = $1 LIMIT 1",
      [req.params.id],
    );

    return res.status(200).json({ store: mapStore(updated.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
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
