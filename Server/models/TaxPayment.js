import mongoose from "mongoose";

const taxPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    taxYear: {
      type: String,
      required: true,
      default: "2026-27",
    },

    estimatedTax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    estimatedQuarterlyTaxes: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    Q1: {
      type: Boolean,
      default: false,
    },

    Q2: {
      type: Boolean,
      default: false,
    },

    Q3: {
      type: Boolean,
      default: false,
    },

    Q4: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// One tax-payment record per user per financial year.
taxPaymentSchema.index(
  { userId: 1, taxYear: 1 },
  { unique: true }
);

export default mongoose.model("TaxPayment", taxPaymentSchema);