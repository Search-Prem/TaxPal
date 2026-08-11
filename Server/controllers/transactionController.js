import Transaction from "../models/Transaction.js";

// Get all transactions for logged-in user
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user_id: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error("Fetch transactions error:", err);
    res.status(500).json({
      error: "Failed to fetch transactions",
    });
  }
};

// Add new transaction
export const createTransaction = async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      date,
      description,
    } = req.body;

    // Prevent future transactions
    const dateOnly = new Date(date).toISOString().slice(0, 10);

    if (new Date(dateOnly) > new Date()) {
      return res.status(400).json({
        error: "Date cannot be in the future",
      });
    }

    const transaction = new Transaction({
      user_id: req.user.id,
      type,
      category,
      amount,
      date: new Date(date),
      description,
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (err) {
    console.error("Create transaction error:", err);
    res.status(400).json({
      error: "Failed to add transaction",
    });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        error: "Transaction not found",
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("Delete transaction error:", err);
    res.status(500).json({
      error: "Failed to delete transaction",
    });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      date,
      description,
    } = req.body;

    // Validate date if provided
    if (date && new Date(date) > new Date()) {
      return res.status(400).json({
        error: "Date cannot be in the future",
      });
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user.id,
      },
      {
        $set: {
          type,
          category,
          amount,
          date: date ? new Date(date) : undefined,
          description,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        error: "Transaction not found",
      });
    }

    res.json(updatedTransaction);
  } catch (err) {
    console.error("Update transaction error:", err);
    res.status(500).json({
      error: "Failed to update transaction",
    });
  }
};