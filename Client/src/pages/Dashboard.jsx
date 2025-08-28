import React from 'react';
import StatCard from '../components/StatCard';
import ExpenseChart from '../components/ExpenseChart';
import FinancialTrendsChart from '../components/FinancialTrendsChart';
import { FaDollarSign, FaRegCalendarAlt } from 'react-icons/fa';
import { FiPercent } from 'react-icons/fi';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Income" amount="12,50,000" currency="₹" icon={<FaDollarSign />} color="text-green-500" />
        <StatCard title="Total Expense" amount="7,00,000" currency="₹" icon={<FaDollarSign />} color="text-red-500" />
        <StatCard title="NetBalance" amount="5,80,000" currency="₹" icon={<FaDollarSign />} color="text-blue-500" />
        <StatCard title="Tax Estimate" amount="2,00,000" currency="₹" icon={<FaDollarSign />} color="text-purple-500" />
        <StatCard title="Savings Rate" amount="%" currency="25" icon={<FiPercent />} color="text-indigo-500" />
        <StatCard title="Upcoming bills" amount="3 Bills Due" icon={<FaRegCalendarAlt />} color="text-yellow-600" isText={true} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Expense Categories</h2>
          <ExpenseChart />
        </div>
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Financial Trends</h2>
          <FinancialTrendsChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;