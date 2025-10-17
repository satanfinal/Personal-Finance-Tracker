import asyncHandler from "express-async-handler";
import Transaction from "../models/Transaction.js";

const getTransactions = asyncHandler(async (req, res) => {
  const { type, category, startDate, endDate } = req.query;

  let filter = { user: req.user._id };

  if (type) {
    if (!["income", "expense"].includes(type)) {
      res.status(400);
      throw new Error("Invalid type filter");
    }
    filter.type = type;
  }
  if (category) {
    filter.category = category;
  }
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(filter).sort({ date: -1 });
  res.json(transactions);
});

const addTransaction = asyncHandler(async (req, res) => {
  const { type, category, amount, date, notes } = req.body;

  if (!type || !["income", "expense"].includes(type)) {
    res.status(400);
    throw new Error("Please provide a valid type: income or expense");
  }
  if (!category) {
    res.status(400);
    throw new Error("Please provide a category");
  }
  if (amount === undefined || isNaN(amount)) {
    res.status(400);
    throw new Error("Please provide a valid amount");
  }

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    category,
    amount,
    date: date ? new Date(date) : Date.now(),
    notes,
  });

  res.status(201).json(transaction);
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, category, amount, date, notes } = req.body;

  const transaction = await Transaction.findById(id);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }
  if (transaction.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this transaction");
  }

  if (type !== undefined) {
    if (!["income", "expense"].includes(type)) {
      res.status(400);
      throw new Error("Invalid type");
    }
    transaction.type = type;
  }
  if (category !== undefined) transaction.category = category;
  if (amount !== undefined) {
    if (isNaN(amount)) {
      res.status(400);
      throw new Error("Invalid amount");
    }
    transaction.amount = amount;
  }
  if (date !== undefined) transaction.date = new Date(date);
  if (notes !== undefined) transaction.notes = notes;

  const updatedTransaction = await transaction.save();
  res.json(updatedTransaction);
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }
  if (transaction.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this transaction");
  }

  await transaction.remove();
  res.json({ message: "Transaction removed" });
});

export { getTransactions, addTransaction, updateTransaction, deleteTransaction };