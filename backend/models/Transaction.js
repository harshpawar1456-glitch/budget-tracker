// models/Transaction.js
// This file describes the SHAPE of one transaction inside MongoDB.
// Mongoose uses this "schema" to validate data before saving it.

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  // How much money. Must be a positive number.
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0.01, "Amount must be greater than 0"],
  },

  // Only these two words are allowed. Anything else is rejected.
  type: {
    type: String,
    required: [true, "Type is required"],
    enum: {
      values: ["income", "expense"],
      message: "Type must be either income or expense",
    },
  },

  // e.g. Salary, Food, Rent
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
    maxlength: [40, "Category is too long"],
  },

  // Optional note about the transaction
  description: {
    type: String,
    default: "",
    trim: true,
    maxlength: [120, "Description is too long"],
  },

  // The date the money moved. Defaults to today.
  date: {
    type: Date,
    default: Date.now,
  },

  // The date this record was created in the database.
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// "Transaction" becomes the "transactions" collection in MongoDB.
module.exports = mongoose.model("Transaction", transactionSchema);