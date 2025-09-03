import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = () => {
  const data = {
    labels: ['Groceries', 'Dining Out', 'Fuel', 'Utilities', 'Travel', 'Health', 'Education', 'Savings'],
    datasets: [
      {
        label: 'Expenses',
        data: [45, 25, 10, 8, 7, 5, 5, 15],
        backgroundColor: [
          '#36A2EB', // Groceries
          '#6C63FF', // Dining Out
          '#FF6384', // Fuel
          '#FF9F40', // Utilities
          '#FFCD56', // Travel
          '#4BC0C0', // Health
          '#9966FF', // Education
          '#C9CBCF', // Savings
        ],
        borderColor: '#ffffff',
        borderWidth: 4,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="relative h-64 w-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute flex items-center justify-center flex-col pointer-events-none">
        {/* <span className="text-3xl font-bold text-gray-800">193100</span> */}
      </div>
    </div>
  );
};

export default ExpenseChart;