import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import Transaction from "../models/Transaction.js"

const router = express.Router()

router.get("/", authMiddleware, async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 })
  res.json(transactions)
})

router.post("/", authMiddleware, async (req, res) => {
  const { description, amount, type, currency, date, category, receiptUrl } = req.body
  const transaction = await Transaction.create({
    user: req.user.id, description, amount, type, currency, date, category, receiptUrl
  })
  const io = req.app.get("io")
  io.to(req.user.id).emit("transaction_added", transaction)
  res.json(transaction)
})

router.put("/:id", authMiddleware, async (req, res) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  )
  if (!transaction) return res.status(404).json({ msg: "Transaction not found" })
  const io = req.app.get("io")
  io.to(req.user.id).emit("transaction_updated", transaction)
  res.json(transaction)
})

router.delete("/:id", authMiddleware, async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!transaction) return res.status(404).json({ msg: "Transaction not found" })
  const io = req.app.get("io")
  io.to(req.user.id).emit("transaction_deleted", req.params.id)
  res.json({ msg: "Deleted" })
})

export default router
