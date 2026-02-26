const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "shipping-service" });
});

app.post("/quote", (req, res) => {
  res.status(200).json({ quotes: [] });
});

app.post("/book", (req, res) => {
  res.status(201).json({ label: req.body });
});

app.get("/track/:reference", (req, res) => {
  res.status(200).json({ tracking: { reference: req.params.reference } });
});

const server = app.listen(PORT, () => {
  console.log(`Shipping Service listening on port ${PORT}`);
});

process.on("SIGTERM", () => server.close());
module.exports = app;
