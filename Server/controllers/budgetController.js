import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

// Create a new budget
export const createBudget = async (req, res) => {
  try {
    const {
      category,
      budgetAmount,
      month,
      description,
    } = req.body;

    if (
      !category ||
      budgetAmount === undefined ||
      !month
    ) {
      return res.status(400).json({
        error:
          "Category, budget amount and month are required",
      });
    }

    const budget = new Budget({
      user_id: req.user.id,
      category: category.trim(),
      budgetAmount: Number(budgetAmount),
      month: month.trim(),
      description,
    });

    await budget.save();

    res.status(201).json(budget);
  } catch (err) {
    console.error(
      "Budget create error:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};

// Get all budgets for logged-in user
export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({
      user_id: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json(budgets);
  } catch (err) {
    console.error(
      "Budget fetch error:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};

// Update budget
export const updateBudget = async (
  req,
  res
) => {
  try {
    const update = {
      ...req.body,
    };

    if (update.category) {
      update.category =
        update.category.trim();
    }

    if (update.month) {
      update.month =
        update.month.trim();
    }

    if (
      update.budgetAmount !== undefined
    ) {
      update.budgetAmount = Number(
        update.budgetAmount
      );
    }

    const updatedBudget =
      await Budget.findOneAndUpdate(
        {
          _id: req.params.id,
          user_id: req.user.id,
        },
        update,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedBudget) {
      return res.status(404).json({
        error: "Budget not found",
      });
    }

    res.json(updatedBudget);
  } catch (err) {
    console.error(
      "Budget update error:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};

// Delete budget
export const deleteBudget = async (
  req,
  res
) => {
  try {
    const deletedBudget =
      await Budget.findOneAndDelete({
        _id: req.params.id,
        user_id: req.user.id,
      });

    if (!deletedBudget) {
      return res.status(404).json({
        error: "Budget not found",
      });
    }

    res.json({
      message: "Budget deleted successfully",
    });
  } catch (err) {
    console.error(
      "Budget delete error:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};

// Check budget status
export const checkBudgetStatus = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const budgets = await Budget.find({
      user_id: userId,
    });

    const results = [];

    for (const budget of budgets) {
      /*
       * Budget month is stored as "YYYY-MM".
       *
       * Example:
       * "2026-08"
       *
       * Start: 2026-08-01
       * End:   2026-09-01
       */

      const [year, month] =
        budget.month
          .split("-")
          .map(Number);

      if (
        !year ||
        !month ||
        month < 1 ||
        month > 12
      ) {
        results.push({
          budgetId: budget._id,
          category: budget.category,
          month: budget.month,
          budgetAmount:
            budget.budgetAmount,
          totalExpense: 0,
          remaining:
            budget.budgetAmount,
          status: "Invalid Budget Month",
        });

        continue;
      }

      const monthStart = new Date(
        year,
        month - 1,
        1
      );

      const monthEnd = new Date(
        year,
        month,
        1
      );

      const expenses =
        await Transaction.aggregate([
          {
            $match: {
              user_id: budget.user_id,

              category: budget.category,

              type: "Expense",

              date: {
                $gte: monthStart,
                $lt: monthEnd,
              },
            },
          },

          {
            $group: {
              _id: null,

              total: {
                $sum: "$amount",
              },
            },
          },
        ]);

      const totalExpense =
        expenses.length > 0
          ? expenses[0].total
          : 0;

      const remaining =
        budget.budgetAmount -
        totalExpense;

      const status =
        totalExpense >
        budget.budgetAmount
          ? "Exceeded"
          : "Within Budget";

      results.push({
        budgetId: budget._id,
        category: budget.category,
        month: budget.month,
        budgetAmount:
          budget.budgetAmount,
        totalExpense,
        remaining,
        status,
      });
    }

    res.json(results);
  } catch (err) {
    console.error(
      "Budget check error:",
      err
    );

    res.status(500).json({
      message: "Error checking budget",
    });
  }
};