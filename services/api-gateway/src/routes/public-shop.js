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

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toAbsoluteUrl = (value, origin) => {
  if (!value) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const normalized = String(value).startsWith("/") ? value : `/${value}`;
  return `${origin}${normalized}`;
};

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const origin = `${protocol}://${req.get("host")}`;
  const storefrontBaseUrl = (
    process.env.CUSTOMER_STOREFRONT_URL || "http://localhost:3101"
  ).replace(/\/$/, "");
  const storefrontUrl = `${storefrontBaseUrl}/shop/${encodeURIComponent(slug)}`;
  const shareUrl = `${origin}${req.originalUrl}`;

  try {
    const result = await pool.query(
      "SELECT store_name, logo_url FROM sme_stores WHERE store_slug = $1 LIMIT 1",
      [slug],
    );

    const store = result.rows[0] || {};
    const storeName = store.store_name || slug;
    const title = `${storeName} | SME Store`;
    const description = `Shop products from ${storeName} on SME Store.`;
    const imageUrl = toAbsoluteUrl(store.logo_url, origin);

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(shareUrl)}" />
    ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : ""}
    <meta http-equiv="refresh" content="0;url=${escapeHtml(storefrontUrl)}" />
    <link rel="canonical" href="${escapeHtml(shareUrl)}" />
  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(storefrontUrl)}">${escapeHtml(storeName)}</a>...</p>
    <script>window.location.replace(${JSON.stringify(storefrontUrl)});</script>
  </body>
</html>`;

    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
