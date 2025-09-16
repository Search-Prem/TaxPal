import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["Income", "Expense"], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }, // store only YYYY-MM-DD
  description: { type: String },
});

export default mongoose.model("Transaction", transactionSchema);
