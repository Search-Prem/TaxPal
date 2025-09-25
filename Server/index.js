import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import transactionsRouter from "./routes/TransRoute.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import taxRoutes from "./routes/taxRoutes.js";
import taxPaymentRoutes from "./routes/taxPaymentRoutes.js";  // ✅ new

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/transactions", transactionsRouter);
app.use("/taxRoutes", taxRoutes);
app.use("/auth", authRoutes);
app.use("/budgets", budgetRoutes);
app.use("/api/taxpayment", taxPaymentRoutes); // ✅ new

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ DB error:", err));

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
