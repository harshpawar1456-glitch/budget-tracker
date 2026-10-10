// models/User.js
// Describes one registered user in MongoDB.
// The password is stored ONLY as a bcrypt hash, never as plain text.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [50, "Name is too long"],
  },

  // unique + lowercase + trim = "Harsh@Mail.com " and "harsh@mail.com"
  // are treated as the same account.
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false, // queries do NOT return the hash unless asked explicitly
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Runs automatically before every save().
// Only hashes when the password is new or changed.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// Helper used by the login route: compares a typed password to the hash.
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);