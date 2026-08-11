import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  checkBudgetStatus,
} from "../controllers/budgetController.js";

const router = express.Router();

// Create budget
router.post("/", authMiddleware, createBudget);

// Get all budgets for logged-in user
router.get("/", authMiddleware, getBudgets);

// Update budget
router.put("/:id", authMiddleware, updateBudget);

// Delete budget
router.delete("/:id", authMiddleware, deleteBudget);

// Check budget status
router.get("/check", authMiddleware, checkBudgetStatus);

export default router;