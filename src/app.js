const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

require("dotenv").config();

const routes = require("./routes");
const passport = require("./config/passport");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.json({ success: true, message: "CampusHub API is live" });
});

app.use("/api/v1", routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

app.use(errorHandler);

module.exports = app;