import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FinancialTrendsChart = ({ transactions }) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Initialize arrays for both income and expense
  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);

  transactions.forEach((t) => {
    const monthIndex = new Date(t.date).getMonth();
    if (t.type === "Income") {
      monthlyIncome[monthIndex] += t.amount;
    } else if (t.type === "Expense") {
      monthlyExpense[monthIndex] += t.amount;
    }
  });

  const data = {
    labels: months,
    datasets: [
      {
        label: "Income",
        data: monthlyIncome,
        backgroundColor: "rgba(54, 162, 235, 0.6)", // blue
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        borderRadius: 5,
      },
      {
        label: "Expense",
        data: monthlyExpense,
        backgroundColor: "rgba(255, 99, 132, 0.6)", // red
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1000, // adjust based on your amounts
        },
        grid: { drawBorder: false },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="h-72">
      <Bar data={data} options={options} />
    </div>
  );
};

export default FinancialTrendsChart;
