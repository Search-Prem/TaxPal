import TaxRecord from "../models/TaxRecord.js";
import TaxPayment from "../models/TaxPayment.js";

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

    // Keep TaxPayment in sync
    await TaxPayment.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          estimatedQuarterlyTaxes:
            estimatedQuarterlyTaxes,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.status(201).json({
      message: "Tax record saved",
      record: newRecord,
    });
  } catch (error) {
    console.error("Error saving record:", error);

    res.status(500).json({
      message: "Error saving record",
      error,
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
      error,
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
      }
    );

    if (!record) {
      return res.status(404).json({
        message: "Tax record not found",
      });
    }

    // Keep TaxPayment in sync if quarterly tax changes
    if (
      update.estimatedQuarterlyTaxes !==
      undefined
    ) {
      await TaxPayment.findOneAndUpdate(
        {
          userId: req.user.id,
        },
        {
          $set: {
            estimatedQuarterlyTaxes:
              update.estimatedQuarterlyTaxes,
          },
        },
        {
          upsert: true,
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