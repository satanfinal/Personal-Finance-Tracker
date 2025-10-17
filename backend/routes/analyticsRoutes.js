import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import Transaction from "../models/Transaction.js"

const router = express.Router()

router.get("/summary", authMiddleware, async (req, res) => {
  const userId = req.user.id
  const transactions = await Transaction.find({ user: userId })
  const income = transactions.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0)
  const expense = transactions.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0)
  const balance = income - expense
  res.json({ income, expense, balance })
})

router.get("/monthly", authMiddleware, async (req, res) => {
  const userId = req.user.id
  const year = new Date().getFullYear()
  const start = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)
  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: start, $lt: end }
  })
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0
  }))
  for (const t of transactions) {
    const m = new Date(t.date).getMonth()
    if (t.type === "income") months[m].income += t.amount
    else if (t.type === "expense") months[m].expense += t.amount
  }
  res.json(months)
})

export default router
