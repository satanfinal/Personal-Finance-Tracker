import express from "express";
import Transaction from "../models/Transaction.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
  res.json(transactions);
});

router.post("/", authMiddleware, async (req, res) => {
  const { type, category, amount, notes } = req.body;
  const transaction = await Transaction.create({
    user: req.user.id,
    type,
    category,
    amount,
    notes
  });
  res.status(201).json(transaction);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

export default router;
