// routes/auth.js
// Register, login, and "who am I" endpoints.

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Creates a signed token that expires in 7 days.
function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Only send safe fields to the browser (never the password).
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// -------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    // The password gets hashed by the pre("save") hook in User.js
    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: "Account created",
      token: createToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    // 11000 = duplicate key (two people registered the same email at once)
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Could not create account" });
  }
});

// -------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // select("+password") because the schema hides it by default
    const user = await User.findOne({ email }).select("+password");

    // Same message for "no such user" and "wrong password",
    // so attackers cannot discover which emails are registered.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    res.json({
      message: "Logged in",
      token: createToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Could not log in" });
  }
});

// -------------------------------------------------
// GET /api/auth/me  (protected)
// -------------------------------------------------
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }
    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Could not load account" });
  }
});

module.exports = router;