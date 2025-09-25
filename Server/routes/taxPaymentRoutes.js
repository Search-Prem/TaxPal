import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import TaxPayment from "../models/TaxPayment.js";

const router = express.Router();

// Create record (rarely used – record is usually auto-created from taxRoutes)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const existing = await TaxPayment.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Tax payment record already exists" });
    }

    const newPayment = new TaxPayment({
      userId: req.user.id,
      estimatedQuarterlyTaxes: req.body.estimatedQuarterlyTaxes || 0,
      Q1: false,
      Q2: false,
      Q3: false,
      Q4: false,
    });
    await newPayment.save();

    res.status(201).json(newPayment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get logged-in user’s tax payment record
router.get("/", authMiddleware, async (req, res) => {
  try {
    const payment = await TaxPayment.findOne({ userId: req.user.id });
    if (!payment) return res.status(404).json({ message: "No record found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update a specific quarter as paid/unpaid
router.put("/:quarter", authMiddleware, async (req, res) => {
  try {
    const { quarter } = req.params; // Q1, Q2, Q3, Q4
    const { paid } = req.body;

    if (!["Q1", "Q2", "Q3", "Q4"].includes(quarter)) {
      return res.status(400).json({ message: "Invalid quarter" });
    }

    const payment = await TaxPayment.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { [quarter]: paid } },   // ✅ use $set
      { new: true }
    );

    if (!payment) return res.status(404).json({ message: "Record not found" });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
