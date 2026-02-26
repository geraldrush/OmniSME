const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "subscription-service" });
});

app.get("/plans", (req, res) => {
  res.status(200).json({ plans: [] });
});

app.post("/subscriptions", (req, res) => {
  res.status(201).json({ subscription: req.body });
});

const server = app.listen(PORT, () => {
  console.log(`Subscription Service listening on port ${PORT}`);
});

process.on("SIGTERM", () => server.close());
module.exports = app;
