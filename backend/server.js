// server.js
// This is the starting point of the backend.
// It creates the web server, connects to MongoDB, and plugs in the routes.

require("dotenv").config(); // reads the .env file into process.env

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const transactionRoutes = require("./routes/transactions");

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware (runs on every request) ----------

// Allows the frontend to call this server from a different address/port.
app.use(cors());

// Turns the incoming JSON body into a normal JavaScript object (req.body).
app.use(express.json());

// Serves the frontend folder, so http://localhost:5000 opens index.html.
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ---------- Routes ----------

// Every URL starting with /api/transactions is handled by transactions.js
app.use("/api/transactions", transactionRoutes);

// A tiny health check you can open in the browser to confirm the server runs.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// If no route matched an /api URL, send JSON instead of an HTML error page.
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// ---------- Connect to MongoDB, then start listening ----------

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // stop the app, there is nothing to serve without a database
  });