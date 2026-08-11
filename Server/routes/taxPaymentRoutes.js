import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import TaxPayment from "../models/TaxPayment.js";

const router = express.Router();


/*
 * Get current user's tax payment information
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const payment = await TaxPayment.findOne({
      userId: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "No tax payment record found.",
      });
    }

    res.json(payment);
  } catch (error) {
    console.error("Tax payment fetch error:", error);

    res.status(500).json({
      message: "Unable to fetch tax payment information.",
    });
  }
});


/*
 * Mark a tax installment as paid/unpaid.
 */
router.put("/:quarter", authMiddleware, async (req, res) => {
  try {
    const { quarter } = req.params;
    const { paid } = req.body;

    if (!["Q1", "Q2", "Q3", "Q4"].includes(quarter)) {
      return res.status(400).json({
        message: "Invalid tax installment.",
      });
    }

    if (typeof paid !== "boolean") {
      return res.status(400).json({
        message: "Paid value must be true or false.",
      });
    }

    const payment = await TaxPayment.findOneAndUpdate(
      {
        userId: req.user.id,
      },
      {
        $set: {
          [quarter]: paid,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!payment) {
      return res.status(404).json({
        message: "Tax payment record not found.",
      });
    }

    res.json(payment);
  } catch (error) {
    console.error("Tax payment update error:", error);

    res.status(500).json({
      message: "Unable to update tax payment.",
    });
  }
});


export default router;