import React, { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import ExpenseChart from "../components/ExpenseChart";
import FinancialTrendsChart from "../components/FinancialTrendsChart";
import { FaDollarSign, FaWallet } from "react-icons/fa";
import { FiPercent } from "react-icons/fi";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [activeBudgets, setActiveBudgets] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch transactions
        const transactionRes = await fetch(
          "/api/transactions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!transactionRes.ok) {
          throw new Error(
            "Failed to fetch transactions"
          );
        }

        const transactionData =
          await transactionRes.json();

        setTransactions(transactionData);

        // Fetch budgets
        const budgetRes = await fetch(
          "/api/budgets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (budgetRes.ok) {
          const budgetData =
            await budgetRes.json();

          setActiveBudgets(
            Array.isArray(budgetData)
              ? budgetData.length
              : 0
          );
        } else {
          setActiveBudgets(0);
        }
      } catch (err) {
        console.error(
          "Failed to load dashboard data:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-6">
        Loading...
      </p>
    );
  }

  // Calculate stats
  const income = transactions
    .filter((t) => t.type === "Income")
    .reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

  const expense = transactions
    .filter((t) => t.type === "Expense")
    .reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

  const balance = income - expense;

  const savingsRate =
    income > 0
      ? ((balance / income) * 100).toFixed(1)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        <StatCard
          title="Total Income"
          amount={income.toLocaleString()}
          currency="₹"
          icon={<FaDollarSign />}
          color="text-green-500"
        />

        <StatCard
          title="Total Expense"
          amount={expense.toLocaleString()}
          currency="₹"
          icon={<FaDollarSign />}
          color="text-red-500"
        />

        <StatCard
          title="Net Balance"
          amount={balance.toLocaleString()}
          currency="₹"
          icon={<FaDollarSign />}
          color="text-blue-500"
        />

        <StatCard
          title="Tax Estimate"
          amount={(expense * 0.2).toLocaleString()}
          currency="₹"
          icon={<FaDollarSign />}
          color="text-purple-500"
        />

        <StatCard
          title="Savings Rate"
          amount={savingsRate}
          currency="%"
          icon={<FiPercent />}
          color="text-indigo-500"
          isText
        />

        <StatCard
          title="Active Budgets"
          amount={activeBudgets}
          icon={<FaWallet />}
          color="text-yellow-600"
          isText
        />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Expense Categories
          </h2>

          <ExpenseChart
            transactions={transactions}
          />
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Financial Trends
          </h2>

          <FinancialTrendsChart
            transactions={transactions}
          />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;