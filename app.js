// app.js
const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const reportRoutes = require("./routes/reportRoutes");
const globalErrorHandler = require("./controllers/errorController");

// Load environment variables
dotenv.config();

const app = express();
const URL = "/api/v1/";
// Middleware
app.use(express.json());

// Routes
// const apiRoutes = require("./routes/api");
// app.use("/api/v1", apiRoutes);

// Routes
app.use(`${URL}auth`, authRoutes);
app.use(`${URL}events`, eventRoutes);
app.use(`${URL}reports`, reportRoutes);
app.use(globalErrorHandler);
// Root Endpoint
app.get("/", (req, res) => {
  res.send("Welcome to your Express app!");
});

module.exports = app;
