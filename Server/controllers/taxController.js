import TaxRecord from "../models/TaxRecord.js";
import TaxPayment from "../models/TaxPayment.js";

const CURRENT_TAX_YEAR = "2026-27";

// Create a new tax record
export const createTaxRecord = async (req, res) => {
  try {
    const {
      region,
      status,
      annualIncome,
      deductions,
      taxableIncome,
      estimatedQuarterlyTaxes,
      estimatedTax,
    } = req.body;

    if (!region || !status || !annualIncome) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const newRecord = new TaxRecord({
      userId: req.user.id,
      region,
      status,
      annualIncome,
      deductions,
      taxableIncome,
      estimatedQuarterlyTaxes,
    });

    await newRecord.save();

    /*
     * Keep TaxPayment synchronized with the latest tax estimate.
     *
     * IMPORTANT:
     * We only update the tax amounts here.
     * We do NOT reset Q1/Q2/Q3/Q4.
     *
     * This means that if the user has already marked a payment
     * as paid, recalculating the tax will not erase that payment.
     */
    const payment = await TaxPayment.findOneAndUpdate(
      {
        userId: req.user.id,
        taxYear: CURRENT_TAX_YEAR,
      },
      {
        $set: {
          estimatedTax: Number(estimatedTax) || 0,
          estimatedQuarterlyTaxes:
            Number(estimatedQuarterlyTaxes) || 0,
        },
        $setOnInsert: {
          userId: req.user.id,
          taxYear: CURRENT_TAX_YEAR,
          Q1: false,
          Q2: false,
          Q3: false,
          Q4: false,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.status(201).json({
      message: "Tax record saved",
      record: newRecord,
      calculation: {
        estimatedTax: payment.estimatedTax,
        estimatedQuarterlyTaxes:
          payment.estimatedQuarterlyTaxes,
      },
    });
  } catch (error) {
    console.error("Error saving record:", error);

    res.status(500).json({
      message: "Error saving record",
      error: error.message,
    });
  }
};

// Get all tax records for logged-in user
export const getTaxRecords = async (req, res) => {
  try {
    const records = await TaxRecord.find({
      userId: req.user.id,
  });

    res.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);

    res.status(500).json({
      message: "Error fetching records",
      error: error.message,
    });
  }
};

// Update a specific tax record
export const updateTaxRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    const record = await TaxRecord.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
      },
      update,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!record) {
      return res.status(404).json({
        message: "Tax record not found",
      });
    }

    /*
     * If the tax estimate is updated, synchronize the
     * TaxPayment record for the current tax year.
     *
     * Existing payment statuses are deliberately preserved.
     */
    const paymentUpdate = {};

    if (update.estimatedTax !== undefined) {
      paymentUpdate.estimatedTax =
        Number(update.estimatedTax) || 0;
    }

    if (update.estimatedQuarterlyTaxes !== undefined) {
      paymentUpdate.estimatedQuarterlyTaxes =
        Number(update.estimatedQuarterlyTaxes) || 0;
    }

    if (Object.keys(paymentUpdate).length > 0) {
      await TaxPayment.findOneAndUpdate(
        {
          userId: req.user.id,
          taxYear: CURRENT_TAX_YEAR,
        },
        {
          $set: paymentUpdate,
          $setOnInsert: {
            userId: req.user.id,
            taxYear: CURRENT_TAX_YEAR,
            Q1: false,
            Q2: false,
            Q3: false,
            Q4: false,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
    }

    res.json(record);
  } catch (err) {
    console.error("Error updating record:", err);

    res.status(500).json({
      message: "Error updating record",
      error: err.message,
    });
  }
};