import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  getProfile,
  updateProfile,
  updateNotifications,
} from "../controllers/userController.js";

const router = express.Router();

// Get logged-in user's profile
router.get("/profile", authMiddleware, getProfile);

// Update logged-in user's profile
router.put("/profile", authMiddleware, updateProfile);

// Update notification preferences
router.put("/notifications", authMiddleware, updateNotifications);

export default router;