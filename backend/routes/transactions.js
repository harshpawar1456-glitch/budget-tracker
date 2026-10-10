// routes/transactions.js
// All the URLs that start with /api/transactions live here.
// EVERY route requires login, and every query is limited to the logged-in user.

const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// A Router is a mini Express app that we plug into server.js
const router = express.Router();

// NEW: every route below this line requires a valid token.
// auth sets req.user.id from the token.
router.use(auth);

// -------------------------------------------------
// GET /api/transactions/summary
// Returns totals for THIS user only.
// Must be written BEFORE "/:id" routes
// so Express does not think "summary" is an id.
// -------------------------------------------------
router.get("/summary", async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

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
// Returns THIS user's transactions, newest date first.
// -------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Could not load transactions" });
  }
});

// -------------------------------------------------
// POST /api/transactions
// Creates one new transaction owned by the logged-in user.
// -------------------------------------------------
router.post("/", async (req, res) => {
  try {
    // req.body holds the JSON the browser sent.
    // We deliberately do NOT read "user" from it.
    const { amount, type, category, description, date } = req.body;

    const transaction = new Transaction({
      user: req.user.id, // from the verified token
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
// Deletes ONLY if the transaction belongs to the logged-in user.
// -------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check the id looks like a real MongoDB id before asking the database
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "That transaction id is not valid" });
    }

    // Match BOTH the id and the owner. Someone else's id finds nothing.
    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    // 404 (not 403) so we do not reveal that the id exists for another user.
    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted", id });
  } catch (error) {
    res.status(500).json({ message: "Could not delete the transaction" });
  }
});

module.exports = router;