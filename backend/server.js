// server.js
// Main backend server for the Budget Tracker

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const transactionRoutes = require("./routes/transactions");

const app = express();

// Render automatically provides PORT in production.
// Locally, the app will use port 5000.
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cors());

app.use(express.json());

// --------------------------------------------------
// Frontend
// --------------------------------------------------

// IMPORTANT:
// The GitHub folder is named "FRONTEND" in uppercase.
// Render runs Linux, where folder names are case-sensitive.
app.use(
  express.static(path.join(__dirname, "..", "FRONTEND"))
);

// --------------------------------------------------
// API Routes
// --------------------------------------------------

app.use("/api/transactions", transactionRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Budget Tracker API is running"
  });
});

// Return JSON for invalid API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found"
  });
});

// --------------------------------------------------
// Frontend fallback
// --------------------------------------------------

// If someone visits the main website,
// send the Budget Tracker index.html file.
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "FRONTEND", "index.html")
  );
});

// --------------------------------------------------
// MongoDB Connection
// --------------------------------------------------

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  });