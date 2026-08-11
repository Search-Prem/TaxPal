import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const ObjectId = mongoose.Types.ObjectId;

// Get monthly financial report
export const getMonthlyReport = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          date: { $type: "date" },
          user_id: new ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
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

    const formatted = data.map((item) => ({
      month: `${new Date(
        item._id.year,
        item._id.month - 1
      ).toLocaleString("default", {
        month: "short",
      })} ${item._id.year}`,

      income: item.totalIncome,
      expense: item.totalExpense,
      net: item.totalIncome - item.totalExpense,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Monthly report error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get quarterly financial report
export const getQuarterlyReport = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          date: { $type: "date" },
          user_id: new ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: {
            quarter: {
              $ceil: {
                $divide: [
                  { $month: "$date" },
                  3,
                ],
              },
            },
            year: {
              $year: "$date",
            },
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
          "_id.quarter": 1,
        },
      },
    ]);

    const formatted = data.map((item) => ({
      quarter: `Q${item._id.quarter} ${item._id.year}`,
      income: item.totalIncome,
      expense: item.totalExpense,
      net: item.totalIncome - item.totalExpense,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Quarterly report error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};