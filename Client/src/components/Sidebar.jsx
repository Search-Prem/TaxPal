import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaFileInvoice, FaBook, FaCalculator, FaChartBar } from "react-icons/fa";

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
    let amount = Number(form.amount);
    if (modalType === "expense" && amount > 0) {
      amount = -amount;
    }
    const rawCategory = categoryMode === "new" ? newCategory : form.category;
    const categoryToUse = capitalize(rawCategory.trim());
    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount, category: categoryToUse })
      });
      setShowModal(false);
      setForm({ date: "", description: "", category: "", amount: "" });
      setCategoryMode("select");
      setNewCategory("");
      if (refreshTransactions) refreshTransactions(); // Refetch after insert
    } catch (err) {
      alert("Failed to add transaction");
    }
  };

  return (
    <aside className="fixed top-16 left-0 h-full w-56 bg-white shadow-md pb-20 flex flex-col justify-between">
      <nav className="mt-6 flex flex-col gap-2 ">
        {links.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              location.pathname === to ? "bg-gray-200 font-semibold" : ""
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

      {/* Modal/Card */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">
              {modalType === "income" ? "Add Income" : "Add Expense"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="date"
                name="date"
                placeholder="Date"
                value={form.date}
                onChange={handleChange}
                required
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
                className="border px-3 py-2 rounded"
              />
              {/* Category Dropdown and Add New */}
              {categoryMode === "select" ? (
                <select
                  name="category"
                  value={form.category}
                  onChange={handleCategoryChange}
                  required
                  className="border px-3 py-2 rounded"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__new__">Add new category</option>
                </select>
              ) : (
                <input
                  type="text"
                  name="newCategory"
                  placeholder="New category"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  required
                  className="border px-3 py-2 rounded"
                />
              )}
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                required
                className="border px-3 py-2 rounded"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add
                </button>
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
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
