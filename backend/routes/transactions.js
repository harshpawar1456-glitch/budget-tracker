// routes/transactions.js
// All the URLs that start with /api/transactions live here.

const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

// A Router is a mini Express app that we plug into server.js
const router = express.Router();

// -------------------------------------------------
// GET /api/transactions/summary
// Returns totals. Must be written BEFORE "/:id" routes
// so Express does not think "summary" is an id.
// -------------------------------------------------
router.get("/summary", async (req, res) => {
  try {
    const transactions = await Transaction.find();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not calculate summary" });
  }
});

// -------------------------------------------------
// GET /api/transactions
// Returns every transaction, newest date first.
// -------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Could not load transactions" });
  }
});

// -------------------------------------------------
// POST /api/transactions
// Creates one new transaction from the form data.
// -------------------------------------------------
router.post("/", async (req, res) => {
  try {
    // req.body holds the JSON the browser sent
    const { amount, type, category, description, date } = req.body;

    const transaction = new Transaction({
      amount,
      type,
      category,
      description,
      // if the user left the date empty, use today
      date: date ? new Date(date) : Date.now(),
    });

    const saved = await transaction.save(); // this writes to MongoDB
    res.status(201).json(saved);
  } catch (error) {
    // A ValidationError means the data broke a schema rule
    if (error.name === "ValidationError") {
      const firstMessage = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: firstMessage });
    }
    res.status(500).json({ message: "Could not save the transaction" });
  }
});

// -------------------------------------------------
// DELETE /api/transactions/:id
// ":id" is a placeholder. Express puts it in req.params.id
// -------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check the id looks like a real MongoDB id before asking the database
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "That transaction id is not valid" });
    }

    const deleted = await Transaction.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted", id });
  } catch (error) {
    res.status(500).json({ message: "Could not delete the transaction" });
  }
});

module.exports = router;