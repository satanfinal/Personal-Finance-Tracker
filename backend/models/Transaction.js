import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, trim: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  currency: { type: String, default: "VND" },
  date: { type: Date, default: Date.now },
  category: { type: String, default: "General" },
  receiptUrl: { type: String },
  recurring: { type: Boolean, default: false }
}, { timestamps: true })

const Transaction = mongoose.model("Transaction", transactionSchema)
export default Transaction
