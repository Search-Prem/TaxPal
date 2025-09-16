import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = ({ transactions }) => {
  // Only take expenses
  const expenses = transactions.filter((t) => t.type === "Expense");

  // Group by category
  const dataByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(dataByCategory),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(dataByCategory),
        backgroundColor: [
          "#36A2EB", "#6C63FF", "#FF6384", "#FF9F40", "#FFCD56",
          "#4BC0C0", "#9966FF", "#C9CBCF"
        ],
        borderColor: "#ffffff",
        borderWidth: 4,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="relative h-64 w-full flex items-center justify-center">
      <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false, cutout: "75%" }} />
    </div>
  );
};

export default ExpenseChart;
