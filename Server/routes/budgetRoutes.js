import express from "express";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";  // ✅ Needed to check expenses
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Create Budget
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { category, budgetAmount, month, description } = req.body;

    const budget = new Budget({
      user_id: req.user.id,   // ✅ Take from JWT
      category,
      budgetAmount,
      month,
      description,
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    console.error("Budget create error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get budgets only for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ user_id: req.user.id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update budget
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedBudget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete budget
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Check budget status (NEW ROUTE)
// ✅ Check budget status (FIXED for string date)
router.get("/check", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all budgets for the user
    const budgets = await Budget.find({ user_id: userId });

    let results = [];

    for (let budget of budgets) {
      // Budget month format: "YYYY-MM"
      const monthPattern = `^${budget.month}`; // Matches any day in that month, e.g., "2025-09"

      // Get total expenses for this category + month
      const expenses = await Transaction.aggregate([
        {
          $match: {
            user_id: budget.user_id,
            category: budget.category,
            type: "Expense", // Must match the schema enum
            date: { $regex: monthPattern },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const totalExpense = expenses.length > 0 ? expenses[0].total : 0;
      const status =
        totalExpense > budget.budgetAmount ? "Exceeded" : "Within Budget";

      results.push({
        category: budget.category,
        month: budget.month,
        budgetAmount: budget.budgetAmount,
        totalExpense,
        remaining: budget.budgetAmount - totalExpense,
        status,
      });
    }

    res.json(results);
  } catch (err) {
    console.error("Budget check error:", err);
    res.status(500).json({ message: "Error checking budget" });
  }
});


export default router;
