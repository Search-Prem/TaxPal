import React, { useState } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";

export default function Logs() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [transactions, setTransactions] = useState([
    { id: 1, date: "2025-09-01", description: "Salary", category: "Income", amount: "+₹50,000" },
    { id: 2, date: "2025-09-02", description: "Groceries", category: "Expense", amount: "-₹2,000" },
    { id: 3, date: "2025-09-02", description: "Freelance Project", category: "Income", amount: "+₹15,000" },
  ]);
  const [editingTx, setEditingTx] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("income");
  const [form, setForm] = useState({ date: "", description: "", category: "", amount: "" });

  const systemLogs = [
    { date: "2025-09-01 09:00", action: "User Login", status: "Success" },
    { date: "2025-09-01 18:00", action: "User Logout", status: "Success" },
    { date: "2025-09-02 10:15", action: "Password Reset", status: "Failed" },
  ];

  // Handle delete
  const handleDelete = (id) => {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

  // Handle edit
  const handleEdit = (tx) => {
    setEditingTx(tx.id);
    setForm({
      date: tx.date,
      description: tx.description,
      category: tx.category,
      amount: tx.amount.replace(/[^\d.-]/g, ""),
    });
    setModalType(tx.category.toLowerCase());
    setShowModal(true);
  };

  // Handle add new or update
  const handleSave = () => {
    if (!form.date || !form.description || !form.amount) return;

    const newTx = {
      id: editingTx || Date.now(),
      date: form.date,
      description: form.description,
      category: modalType === "income" ? "Income" : "Expense",
      amount: modalType === "income" ? `+₹${form.amount}` : `-₹${form.amount}`,
    };

    if (editingTx) {
      setTransactions(transactions.map((tx) => (tx.id === editingTx ? newTx : tx)));
    } else {
      setTransactions([...transactions, newTx]);
    }

    setEditingTx(null);
    setForm({ date: "", description: "", category: "", amount: "" });
    setShowModal(false);
  };

  return (
    <div className="p-6 bg-white">
      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`pb-2 font-medium ${
            activeTab === "transactions" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`pb-2 font-medium ${
            activeTab === "system" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
          }`}
        >
          System Logs
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <>
          {/* Transaction Filters */}
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="text-xl font-semibold mb-4">Transaction Overview</h3>
            <div className="flex gap-4 flex-wrap">
              <input type="date" className="border p-2 rounded w-40" />
              <select className="border p-2 rounded w-40">
                <option>All categories</option>
                <option>Income</option>
                <option>Expense</option>
              </select>
              <input type="text" placeholder="Search..." className="border p-2 rounded flex-1" />
              <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
                <FaSearch /> Apply
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
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{tx.date}</td>
                    <td className="p-2 border">{tx.description}</td>
                    <td className="p-2 border">{tx.category}</td>
                    <td
                      className={`p-2 border font-medium ${
                        tx.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.amount}
                    </td>
                    <td className="p-2 border flex gap-2">
                      <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEdit(tx)}>
                        <FaEdit />
                      </button>
                      <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(tx.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => {
                setModalType("income");
                setEditingTx(null);
                setForm({ date: "", description: "", category: "", amount: "" });
                setShowModal(true);
              }}
            >
              Add Income
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => {
                setModalType("expense");
                setEditingTx(null);
                setForm({ date: "", description: "", category: "", amount: "" });
                setShowModal(true);
              }}
            >
              Add Expense
            </button>
          </div>
        </>
      )}

      {/* System Logs Tab */}
      {activeTab === "system" && (
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4">System Logs</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left border">Date & Time</th>
                <th className="p-2 text-left border">Action</th>
                <th className="p-2 text-left border">Status</th>
              </tr>
            </thead>
            <tbody>
              {systemLogs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-2 border">{log.date}</td>
                  <td className="p-2 border">{log.action}</td>
                  <td
                    className={`p-2 border font-medium ${
                      log.status === "Success" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {log.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {editingTx ? "Edit Transaction" : `Add ${modalType === "income" ? "Income" : "Expense"}`}
            </h3>
            <div className="flex flex-col gap-3">
              <input
                type="date"
                className="border p-2 rounded"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                className="border p-2 rounded"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Amount"
                className="border p-2 rounded"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button className="px-4 py-2 border rounded" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
