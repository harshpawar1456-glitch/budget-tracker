// middleware/auth.js
// Put this in front of any route that needs a logged-in user.
// It reads "Authorization: Bearer <token>", verifies it, and sets req.user.id.

const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;

  // 1. Header must exist and look like "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not logged in. Please log in." });
  }

  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Not logged in. Please log in." });
  }

  // 2. Server must be configured with a secret
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set");
    return res.status(500).json({ message: "Server configuration error" });
  }

  // 3. Verify signature and expiry
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // the ONLY source of the user id
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid session. Please log in again." });
  }
};