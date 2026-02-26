const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3007;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "job-board-service" });
});

app.get("/leads", (req, res) => {
  res.status(200).json({ leads: [] });
});

app.post("/analyze", (req, res) => {
  res.status(200).json({ analyzed: true });
});

const server = app.listen(PORT, () => {
  console.log(`Job Board Service listening on port ${PORT}`);
});

process.on("SIGTERM", () => server.close());
module.exports = app;
