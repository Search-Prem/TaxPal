import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";

import {
  getFinancialYears,
  getSummary,
  getMonthlyReport,
  getQuarterlyReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.get(
  "/financial-years",
  authMiddleware,
  getFinancialYears
);

router.get(
  "/summary",
  authMiddleware,
  getSummary
);

router.get(
  "/monthly",
  authMiddleware,
  getMonthlyReport
);

router.get(
  "/quarterly",
  authMiddleware,
  getQuarterlyReport
);

export default router;