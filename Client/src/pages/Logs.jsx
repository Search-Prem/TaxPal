import React from "react";

export default function Logs() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Income & Expense Log</h2>

      {/* Transaction Overview */}
      <div className="border rounded-lg p-4 mb-6">
        <h3 className="text-xl font-semibold mb-4">Transaction Overview</h3>
        <div className="flex gap-4 flex-wrap">
          <input type="date" className="border p-2 rounded w-40" />
          <select className="border p-2 rounded w-40">
            <option>All categories</option>
          </select>
          <select className="border p-2 rounded w-40">
            <option>All</option>
          </select>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="border rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border">Date</th>
              <th className="p-2 text-left border">Description</th>
              <th className="p-2 text-left border">Category</th>
              <th className="p-2 text-left border">Amount</th>
              <th className="p-2 text-left border">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">-</td>
              <td className="p-2 border">-</td>
              <td className="p-2 border">-</td>
              <td className="p-2 border">-</td>
              <td className="p-2 border">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Income
        </button>
        <button className="bg-gray-400 text-white px-4 py-2 rounded">
          Add Expense
        </button>
      </div>
    </div>
  );
}
