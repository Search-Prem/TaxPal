import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();

// Get all transactions
router.get("/", authMiddleware, getTransactions);

// Add new transaction
router.post("/", authMiddleware, createTransaction);

// Delete transaction
router.delete("/:id", authMiddleware, deleteTransaction);

// Update transaction
router.put("/:id", authMiddleware, updateTransaction);

export default router;