import express from "express";
import TaxRecord from "../models/TaxRecord.js";
import TaxPayment from "../models/TaxPayment.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { calculateTax } from "../services/taxCalculator.js";

const router = express.Router();

/*
 * Create tax record
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      region,
      annualIncome,
      deductions = 0,
      incomeType = "Other",
      isResident = true,
    } = req.body;

    if (!region || annualIncome === undefined) {
      return res.status(400).json({
        message: "Region and annual income are required.",
      });
    }

    const calculation = calculateTax({
      region,
      annualIncome,
      deductions,
      incomeType,
      isResident,
    });

    const newRecord = new TaxRecord({
      userId: req.user.id,
      region,
      status: incomeType,
      annualIncome: calculation.annualIncome,
      deductions: calculation.totalDeductions,
      taxableIncome: calculation.taxableIncome,
      estimatedQuarterlyTaxes: calculation.totalTax / 4,
    });

    await newRecord.save();

    /*
     * Keep tax-payment calendar synchronized with
     * the authoritative calculation.
     */
    await TaxPayment.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          estimatedTax: calculation.totalTax,
          estimatedQuarterlyTaxes: calculation.totalTax / 4,
          taxYear: "2026-27",
        },
        $setOnInsert: {
          userId: req.user.id,
          Q1: false,
          Q2: false,
          Q3: false,
          Q4: false,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.status(201).json({
      message: "Tax estimate recorded successfully.",
      calculation,
      record: newRecord,
    });
  } catch (error) {
    console.error("Tax calculation error:", error);

    res.status(400).json({
      message: error.message || "Unable to calculate tax.",
    });
  }
});


/*
 * Get current user's tax records
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const records = await TaxRecord.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    console.error("Error fetching tax records:", error);

    res.status(500).json({
      message: "Error fetching tax records.",
    });
  }
});


/*
 * Recalculate an existing tax record.
 *
 * IMPORTANT:
 * The client cannot directly change calculated values.
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existingRecord = await TaxRecord.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!existingRecord) {
      return res.status(404).json({
        message: "Tax record not found.",
      });
    }

    const {
      region,
      annualIncome,
      deductions = 0,
      incomeType = existingRecord.status || "Other",
      isResident = true,
    } = req.body;

    const calculation = calculateTax({
      region,
      annualIncome,
      deductions,
      incomeType,
      isResident,
    });

    existingRecord.region = region;
    existingRecord.status = incomeType;
    existingRecord.annualIncome = calculation.annualIncome;
    existingRecord.deductions = calculation.totalDeductions;
    existingRecord.taxableIncome = calculation.taxableIncome;
    existingRecord.estimatedQuarterlyTaxes =
      calculation.totalTax / 4;

    await existingRecord.save();

    await TaxPayment.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          estimatedTax: calculation.totalTax,
          estimatedQuarterlyTaxes:
            calculation.totalTax / 4,
          taxYear: "2026-27",
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json({
      message: "Tax estimate updated successfully.",
      calculation,
      record: existingRecord,
    });
  } catch (error) {
    console.error("Tax update error:", error);

    res.status(400).json({
      message: error.message || "Unable to update tax estimate.",
    });
  }
});


export default router;