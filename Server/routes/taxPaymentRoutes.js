import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  getTaxPayment,
  updateTaxPayment,
} from "../controllers/taxPaymentController.js";

const router = express.Router();

// Get current user's tax payment information
router.get("/", authMiddleware, getTaxPayment);

// Mark a quarterly installment as paid/unpaid
router.put("/:quarter", authMiddleware, updateTaxPayment);

export default router;