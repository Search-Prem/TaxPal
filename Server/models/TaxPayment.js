import mongoose from "mongoose";

const taxPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    estimatedQuarterlyTaxes: { type: Number, required: true },
    Q1: { type: Boolean, default: false }, // April – June
    Q2: { type: Boolean, default: false }, // July – Sept
    Q3: { type: Boolean, default: false }, // Oct – Dec
    Q4: { type: Boolean, default: false }, // Jan – March
  },
  { timestamps: true }
);

export default mongoose.model("TaxPayment", taxPaymentSchema);
