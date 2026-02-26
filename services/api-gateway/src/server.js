const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const winston = require("winston");
require("dotenv").config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3100", // Admin panel
      "http://localhost:3101", // Customer storefront
      process.env.ADMIN_PANEL_URL,
      process.env.CUSTOMER_STOREFRONT_URL,
    ],
    credentials: true,
  }),
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.API_RATE_LIMIT || 100,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "api-gateway",
  });
});

// API version endpoint
app.get("/api/v1", (req, res) => {
  res.status(200).json({
    version: "1.0.0",
    service: "SME E-commerce API Gateway",
    timestamp: new Date().toISOString(),
  });
});

// User Service Routes (proxy to user-service)
app.use("/api/v1/auth", require("./routes/auth.js"));
app.use("/api/v1/users", require("./routes/users.js"));

// Product Service Routes
app.use("/api/v1/products", require("./routes/products.js"));
app.use("/api/v1/categories", require("./routes/categories.js"));

// Order Service Routes
app.use("/api/v1/orders", require("./routes/orders.js"));
app.use("/api/v1/carts", require("./routes/carts.js"));

// Payment Service Routes
app.use("/api/v1/payments", require("./routes/payments.js"));

// Shipping Service Routes
app.use("/api/v1/shipping", require("./routes/shipping.js"));

// Subscription Service Routes
app.use("/api/v1/subscriptions", require("./routes/subscriptions.js"));

// Stores Route
app.use("/api/v1/stores", require("./routes/stores.js"));

// ============================================
// ERROR HANDLING
// ============================================

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    status: err.status || 500,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
  logger.info(`API Gateway listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
  });
});

module.exports = app;
