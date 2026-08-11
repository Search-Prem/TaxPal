import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  getMonthlyReport,
  getQuarterlyReport,
} from "../controllers/reportController.js";

const router = express.Router();

// Monthly report
router.get(
  "/monthly",
  authMiddleware,
  getMonthlyReport
);

// Quarterly report
router.get(
  "/quarterly",
  authMiddleware,
  getQuarterlyReport
);

export default router;