import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import taxRoutes from "./routes/taxRoutes.js";
import taxPaymentRoutes from "./routes/taxPaymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
// Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/taxRoutes", taxRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/taxpayment", taxPaymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/user", userRoutes);

// Error handling middleware
app.use(errorMiddleware);
// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});