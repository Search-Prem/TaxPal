import React, { useState } from "react";
import { FaUniversity, FaReceipt } from "react-icons/fa";
import { FiPercent } from "react-icons/fi";
import { BsFillFileEarmarkTextFill } from "react-icons/bs";

// Country-specific tax rate logic
function getTaxRate(region, status) {
  
  if (region === "India") {
    return status === "Single" ? 25 : 20;
  }
  if (region === "United States") {
    return status === "Single" ? 22 : 12;
  }
  if (region === "United Kingdom") {
    return status === "Single" ? 20 : 15;
  }
  if (region === "Australia") {
    return status === "Single" ? 19 : 17;
  }
  return 25; // assume to be default
}

export default function TaxEstimator() {
  const [region, setRegion] = useState("India");
  const [status, setStatus] = useState("Single");
  const [income, setIncome] = useState(""); // keep as string
  const [deductions, setDeductions] = useState(""); // keep as string

  // convert safely for calculations
  const incomeNum = parseFloat(income) || 0;
  const deductionsNum = parseFloat(deductions) || 0;

  // Use country-specific tax rate
  const taxRate = getTaxRate(region, status);
  const taxableIncome = Math.max(incomeNum - deductionsNum, 0);
  const estimatedTax = (taxableIncome * taxRate) / 100;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800">Tax Estimation</h1>
      <p className="text-gray-500">
        Estimate your Tax Liabilities based on your financial data and chosen profile.
      </p>

      {/* Tax Profile */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Your Tax Profile</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select your region and filing status for accurate estimations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tax Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded-md"
            >
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Australia</option>
            </select>
          </div>

          {/* Filing Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Filing Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded-md"
            >
              <option>Single</option>
              <option>Married</option>
              <option>Business</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Inputs */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Enter Your Financials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Income */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Annual Income (₹)</label>
            <input
              type="number"
              inputMode="numeric"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g. 600000"
              className="mt-1 w-full border px-3 py-2 rounded-md"
            />
          </div>

          {/* Deductions */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Deductions (₹)</label>
            <input
              type="number"
              inputMode="numeric"
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
              placeholder="e.g. 150000"
              className="mt-1 w-full border px-3 py-2 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={<FaUniversity className="text-blue-500 text-2xl" />}
          title="Estimated Quarterly Taxes"
          value={`₹${(estimatedTax / 4).toLocaleString("en-IN")}`}
          subtitle="Based on your current income and deductions."
        />
        <SummaryCard
          icon={<FiPercent className="text-indigo-500 text-2xl" />}
          title="Applicable Tax Rate"
          value={`${taxRate}%`}
          subtitle="Your marginal tax rate for the current period."
        />
        <SummaryCard
          icon={<BsFillFileEarmarkTextFill className="text-green-500 text-2xl" />}
          title="Total Deductions"
          value={`₹${deductionsNum.toLocaleString("en-IN")}`}
          subtitle="Eligible expenses reducing your taxable income."
        />
        <SummaryCard
          icon={<FaReceipt className="text-red-500 text-2xl" />}
          title="Taxable Income"
          value={`₹${taxableIncome.toLocaleString("en-IN")}`}
          subtitle="Total income subject to tax after deductions."
        />
      </div>

      {/* Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Detail Tax Calculation</h2>
        <p className="text-sm text-gray-500 mb-3">
          Breakdown of Income and Deductions — understand how your estimated tax figures are derived.
        </p>

        <div className="space-y-2">
          <details className="border rounded-md">
            <summary className="cursor-pointer px-4 py-2 font-medium text-gray-700">Income Sources</summary>
            <div className="px-4 py-2 text-gray-600">
              Salary, Business, Freelance, Investments...
            </div>
          </details>

          <details className="border rounded-md">
            <summary className="cursor-pointer px-4 py-2 font-medium text-gray-700">Deductible Sources</summary>
            <div className="px-4 py-2 text-gray-600">
              Insurance, Retirement savings, Donations, Medical bills...
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

// Reusable summary card
function SummaryCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-start">
      <div className="mb-2">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
