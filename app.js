// app.js
const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

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
app.use(`${URL}users`, userRoutes);

app.use(globalErrorHandler);

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Welcome to your Express app!");
});

module.exports = app;
