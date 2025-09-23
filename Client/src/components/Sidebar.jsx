import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaFileInvoice, FaBook, FaCalculator, FaChartBar, FaCalendarAlt } from "react-icons/fa";

export default function Sidebar({ categories, refreshTransactions }) {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("income");
  const [form, setForm] = useState({
    date: "",
    description: "",
    category: "",
    amount: ""
  });
  const [categoryMode, setCategoryMode] = useState("select"); // 'select' or 'new'
  const [newCategory, setNewCategory] = useState("");

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/logs", label: "Logs", icon: <FaFileInvoice /> },
    { to: "/budgeting", label: "Budgeting", icon: <FaBook /> },
    { to: "/tax-estimator", label: "Tax Estimator", icon: <FaCalculator /> },
    { to: "/report", label: "Report", icon: <FaChartBar /> },
    { to: "/tax-calendar", label: "Tax Calendar", icon: <FaCalendarAlt /> }, // ✅ New Tax Calendar link
  ];

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    if (e.target.value === "__new__") {
      setCategoryMode("new");
      setForm({ ...form, category: "" });
    } else {
      setCategoryMode("select");
      setForm({ ...form, category: e.target.value });
    }
  };

  const capitalize = str =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    const rawCategory = categoryMode === "new" ? newCategory : form.category;
    const categoryToUse = capitalize(rawCategory.trim());
    const token = localStorage.getItem("token");  // <-- FIX

    try {
      await fetch("http://localhost:5001/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          amount,
          category: categoryToUse,
          type: modalType === "income" ? "Income" : "Expense"
        })
      });
      setShowModal(false);
      setForm({ date: "", description: "", category: "", amount: "" });
      setCategoryMode("select");
      setNewCategory("");
      if (refreshTransactions) refreshTransactions();
    } catch (err) {
      alert("Failed to add transaction");
    }
  };


  return (
    <>
    <aside className="fixed top-16 left-0 h-full w-56 bg-white shadow-md pb-20 flex flex-col justify-between">
      <nav className="mt-6 flex flex-col gap-2 ">
        {links.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 ${location.pathname === to ? "bg-gray-200 font-semibold" : ""
              }`}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-4 flex flex-col gap-2">
        <button
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          onClick={() => {
            setModalType("income");
            setShowModal(true);
          }}
        >
          Add Income
        </button>
        <button
          className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150"
          onClick={() => {
            setModalType("expense");
            setShowModal(true);
          }}
        >
          Add Expense
        </button>
      </div>
    </aside>     
      {/* Modal/Card */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-30">
          {/* Add vertical padding so there’s equal space at top and bottom */}
          <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {modalType === "income" ? "Record New Income" : "Record New Expense"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Add details about your {modalType} to track your finances better.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setShowModal(false);
                    setCategoryMode("select");
                    setNewCategory("");
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Description
                  <input
                    type="text"
                    name="description"
                    placeholder="e.g. Web Design Project"
                    value={form.description}
                    onChange={handleChange}
                    required
                    className="mt-1 border px-3 py-2 rounded w-full"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Amount
                  <input
                    type="number"
                    name="amount"
                    placeholder="$ 0.00"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    className="mt-1 border px-3 py-2 rounded w-full"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Category
                    {categoryMode === "select" ? (
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleCategoryChange}
                        required
                        className="mt-1 border px-3 py-2 rounded w-full"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__new__">Add new category</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="newCategory"
                        placeholder="New category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        required
                        className="mt-1 border px-3 py-2 rounded w-full"
                      />
                    )}
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Date
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split("T")[0]}   // ✅ disallow future dates
                      className="mt-1 border px-3 py-2 rounded w-full"
                    />
                  </label>
                </div>

                <label className="text-sm font-medium text-gray-700">
                  Notes (Optional)
                  <textarea
                    name="notes"
                    placeholder="Add any additional details..."
                    value={form.notes || ""}
                    onChange={handleChange}
                    className="mt-1 border px-3 py-2 rounded w-full"
                    rows={3}
                  />
                </label>

                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    onClick={() => {
                      setShowModal(false);
                      setCategoryMode("select");
                      setNewCategory("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


    
    </>
  );
}
