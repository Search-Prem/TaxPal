import express from "express";
import TaxRecord from "../models/TaxRecord.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// record income + taxes
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { region, status, annualIncome, deductions, taxableIncome, estimatedQuarterlyTaxes } = req.body;

    if (!region || !status || !annualIncome) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRecord = new TaxRecord({
      userId: req.user.id, // ✅ from token
      region,
      status,
      annualIncome,
      deductions,
      taxableIncome,
      estimatedQuarterlyTaxes,
    });

    await newRecord.save();
    res.status(201).json({ message: "Tax record saved", record: newRecord });
  } catch (error) {
    console.error("Error saving record:", error);
    res.status(500).json({ message: "Error saving record", error });
  }
});

// get all tax records for logged in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const records = await TaxRecord.find({ userId: req.user.id });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching records", error });
  }
});

export default router;
