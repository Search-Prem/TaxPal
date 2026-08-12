import TaxPayment from "../models/TaxPayment.js";

const CURRENT_TAX_YEAR = "2026-27";

// Get the logged-in user's tax payment information
export const getTaxPayment = async (req, res) => {
  try {
    const payment = await TaxPayment.findOne({
      userId: req.user.id,
      taxYear: CURRENT_TAX_YEAR,
    });

    if (!payment) {
      return res.status(404).json({
        message:
          "No tax payment record found for the current tax year.",
      });
    }

    res.json(payment);
  } catch (error) {
    console.error("Tax payment fetch error:", error);

    res.status(500).json({
      message: "Unable to fetch tax payment information.",
    });
  }
};

// Mark a specific quarterly installment as paid/unpaid
export const updateTaxPayment = async (req, res) => {
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
        taxYear: CURRENT_TAX_YEAR,
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
        message:
          "No tax payment record found for the current tax year. Calculate your tax first.",
      });
    }

    res.json({
      message: `${quarter} payment status updated successfully.`,
      payment,
    });
  } catch (error) {
    console.error("Tax payment update error:", error);

    res.status(500).json({
      message: "Unable to update tax payment.",
    });
  }
};