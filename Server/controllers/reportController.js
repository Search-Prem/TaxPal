import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const ObjectId = mongoose.Types.ObjectId;

/*
  Indian Financial Year:
  FY 2026-27 = 01-Apr-2026 through 31-Mar-2027
*/

const getCurrentFinancialYear = () => {
  const now = new Date();

  const year =
    now.getMonth() >= 3
      ? now.getFullYear()
      : now.getFullYear() - 1;

  return `${year}-${String(year + 1).slice(-2)}`;
};

const parseFinancialYear = (financialYear) => {
  const match = /^(\d{4})-(\d{2})$/.exec(financialYear);

  if (!match) {
    return null;
  }

  const startYear = Number(match[1]);
  const endYear = Number(`20${match[2]}`);

  if (endYear !== startYear + 1) {
    return null;
  }

  return {
    startYear,
    startDate: new Date(Date.UTC(startYear, 3, 1)),
    endDate: new Date(Date.UTC(startYear + 1, 3, 1)),
  };
};

/*
  GET /api/reports/financial-years
  Returns financial years that contain transactions,
  plus the current financial year.
*/
export const getFinancialYears = async (req, res) => {
  try {
    const userId = new ObjectId(req.user.id);

    const transactions = await Transaction.find({
      user_id: userId,
      date: { $type: "date" },
    })
      .select("date")
      .lean();

    const years = new Set();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const year =
        date.getUTCMonth() >= 3
          ? date.getUTCFullYear()
          : date.getUTCFullYear() - 1;

      years.add(`${year}-${String(year + 1).slice(-2)}`);
    });

    // Always include the current FY.
    years.add(getCurrentFinancialYear());

    const sortedYears = [...years].sort((a, b) => {
      return Number(b.substring(0, 4)) - Number(a.substring(0, 4));
    });

    res.json(sortedYears);
  } catch (error) {
    console.error("Financial years error:", error);
    res.status(500).json({
      message: "Failed to fetch financial years",
    });
  }
};


/*
  GET /api/reports/summary?financialYear=2026-27
*/
export const getSummary = async (req, res) => {
  try {
    const financialYear =
      req.query.financialYear || getCurrentFinancialYear();

    const range = parseFinancialYear(financialYear);

    if (!range) {
      return res.status(400).json({
        message: "Invalid financial year. Use format YYYY-YY.",
      });
    }

    const userId = new ObjectId(req.user.id);

    const result = await Transaction.aggregate([
      {
        $match: {
          user_id: userId,
          date: {
            $gte: range.startDate,
            $lt: range.endDate,
          },
        },
      },
      {
        $group: {
          _id: null,

          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Income"] },
                "$amount",
                0,
              ],
            },
          },

          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Expense"] },
                "$amount",
                0,
              ],
            },
          },

          transactionCount: {
            $sum: 1,
          },
        },
      },
    ]);

    const data = result[0] || {
      totalIncome: 0,
      totalExpense: 0,
      transactionCount: 0,
    };

    res.json({
      financialYear,
      totalIncome: data.totalIncome,
      totalExpense: data.totalExpense,
      netSavings: data.totalIncome - data.totalExpense,
      transactionCount: data.transactionCount,
    });
  } catch (error) {
    console.error("Report summary error:", error);

    res.status(500).json({
      message: "Failed to generate report summary",
    });
  }
};


/*
  GET /api/reports/monthly?financialYear=2026-27

  Returns all 12 months of the selected FY,
  including months with zero transactions.
*/
export const getMonthlyReport = async (req, res) => {
  try {
    const financialYear =
      req.query.financialYear || getCurrentFinancialYear();

    const range = parseFinancialYear(financialYear);

    if (!range) {
      return res.status(400).json({
        message: "Invalid financial year. Use format YYYY-YY.",
      });
    }

    const userId = new ObjectId(req.user.id);

    const data = await Transaction.aggregate([
      {
        $match: {
          user_id: userId,
          date: {
            $gte: range.startDate,
            $lt: range.endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },

          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Income"] },
                "$amount",
                0,
              ],
            },
          },

          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Expense"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const lookup = new Map();

    data.forEach((item) => {
      lookup.set(
        `${item._id.year}-${item._id.month}`,
        {
          income: item.totalIncome,
          expense: item.totalExpense,
        }
      );
    });

    const months = [];

    // April → March
    for (let index = 0; index < 12; index++) {
      const monthNumber = ((3 + index) % 12) + 1;

      const year =
        monthNumber >= 4
          ? range.startYear
          : range.startYear + 1;

      const key = `${year}-${monthNumber}`;

      const values = lookup.get(key) || {
        income: 0,
        expense: 0,
      };

      const date = new Date(
        Date.UTC(year, monthNumber - 1, 1)
      );

      const monthName = date.toLocaleString("en-IN", {
        month: "short",
        timeZone: "UTC",
      });

      months.push({
        financialYear,
        month: `${monthName} ${year}`,
        monthNumber,
        income: values.income,
        expense: values.expense,
        net: values.income - values.expense,
      });
    }

    res.json(months);
  } catch (error) {
    console.error("Monthly report error:", error);

    res.status(500).json({
      message: "Failed to generate monthly report",
    });
  }
};


/*
  GET /api/reports/quarterly?financialYear=2026-27

  Q1 = Apr-Jun
  Q2 = Jul-Sep
  Q3 = Oct-Dec
  Q4 = Jan-Mar
*/
export const getQuarterlyReport = async (req, res) => {
  try {
    const financialYear =
      req.query.financialYear || getCurrentFinancialYear();

    const range = parseFinancialYear(financialYear);

    if (!range) {
      return res.status(400).json({
        message: "Invalid financial year. Use format YYYY-YY.",
      });
    }

    const userId = new ObjectId(req.user.id);

    const data = await Transaction.aggregate([
      {
        $match: {
          user_id: userId,
          date: {
            $gte: range.startDate,
            $lt: range.endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            month: { $month: "$date" },
          },

          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Income"] },
                "$amount",
                0,
              ],
            },
          },

          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Expense"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const quarters = [
      {
        quarter: "Q1",
        months: [4, 5, 6],
      },
      {
        quarter: "Q2",
        months: [7, 8, 9],
      },
      {
        quarter: "Q3",
        months: [10, 11, 12],
      },
      {
        quarter: "Q4",
        months: [1, 2, 3],
      },
    ];

    const lookup = new Map();

    data.forEach((item) => {
      lookup.set(item._id.month, {
        income: item.totalIncome,
        expense: item.totalExpense,
      });
    });

    const formatted = quarters.map((quarter) => {
      let income = 0;
      let expense = 0;

      quarter.months.forEach((month) => {
        const values = lookup.get(month);

        if (values) {
          income += values.income;
          expense += values.expense;
        }
      });

      return {
        financialYear,
        quarter: `${quarter.quarter} ${financialYear}`,
        income,
        expense,
        net: income - expense,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Quarterly report error:", error);

    res.status(500).json({
      message: "Failed to generate quarterly report",
    });
  }
};