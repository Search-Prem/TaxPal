import { useState, useEffect } from "react";
import { FaUser, FaBell, FaList, FaEdit, FaTimes } from "react-icons/fa";

export default function Category() {
  const [activeTab, setActiveTab] = useState("category");
  const [activeSection, setActiveSection] = useState("income");

  // Load categories from localStorage OR use defaults
  const [incomeCategories, setIncomeCategories] = useState(() => {
    return JSON.parse(localStorage.getItem("incomeCategories")) || [
      { name: "Salary", color: "bg-green-500" },
      { name: "Business", color: "bg-blue-500" },
      { name: "Investments", color: "bg-purple-500" },
    ];
  });

  const [expenseCategories, setExpenseCategories] = useState(() => {
    return JSON.parse(localStorage.getItem("expenseCategories")) || [
      { name: "Food", color: "bg-red-500" },
      { name: "Rent", color: "bg-yellow-500" },
      { name: "Travel", color: "bg-orange-500" },
    ];
  });

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("incomeCategories", JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  useEffect(() => {
    localStorage.setItem("expenseCategories", JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState("income");
  const [editIndex, setEditIndex] = useState(null); // if null → Add, else Edit
  const [editType, setEditType] = useState(null);

  // Open modal for Add
  const handleAddClick = () => {
    setNewCategory("");
    setNewType("income");
    setEditIndex(null);
    setEditType(null);
    setShowModal(true);
  };

  // Open modal for Edit
  const handleEditClick = (cat, index, type) => {
    setNewCategory(cat.name);
    setNewType(type);
    setEditIndex(index);
    setEditType(type);
    setShowModal(true);
  };

  // Save (Add or Edit)
  const handleSaveCategory = () => {
    if (!newCategory.trim()) return;

    const colorPalette = [
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-lime-500",
    ];
    const randomColor =
      colorPalette[Math.floor(Math.random() * colorPalette.length)];

    if (editIndex !== null) {
      // Editing existing category
      if (editType === "income") {
        const updated = [...incomeCategories];
        updated[editIndex] = { ...updated[editIndex], name: newCategory };
        setIncomeCategories(updated);
      } else {
        const updated = [...expenseCategories];
        updated[editIndex] = { ...updated[editIndex], name: newCategory };
        setExpenseCategories(updated);
      }
    } else {
      // Adding new category
      if (newType === "income") {
        setIncomeCategories([
          ...incomeCategories,
          { name: newCategory, color: randomColor },
        ]);
      } else {
        setExpenseCategories([
          ...expenseCategories,
          { name: newCategory, color: randomColor },
        ]);
      }
    }

    setNewCategory("");
    setNewType("income");
    setEditIndex(null);
    setEditType(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Settings Header */}
      <div className="bg-white shadow p-4 border-b">
        <h1 className="text-xl font-bold text-gray-700">Settings</h1>
        <p className="text-gray-500 text-sm">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Layout */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 bg-white shadow-md border-r min-h-[calc(100vh-80px)] p-4">
          <div
            className={`flex items-center gap-3 p-3 mb-2 rounded cursor-pointer ${
              activeTab === "profile"
                ? "bg-gray-100 border-l-4 border-blue-600"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser className="text-gray-700" />
            <span className="text-gray-700">Profile</span>
          </div>
          <div
            className={`flex items-center gap-3 p-3 mb-2 rounded cursor-pointer ${
              activeTab === "notifications"
                ? "bg-gray-100 border-l-4 border-blue-600"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <FaBell className="text-gray-700" />
            <span className="text-gray-700">Notifications</span>
          </div>
          <div
            className={`flex items-center gap-3 p-3 mb-2 rounded cursor-pointer ${
              activeTab === "category"
                ? "bg-gray-100 border-l-4 border-blue-600"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("category")}
          >
            <FaList className="text-gray-700" />
            <span className="text-gray-700">Category</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6">
          {/* Profile */}
          {activeTab === "profile" && (
            <div className="bg-white p-6 rounded shadow border">
              <h2 className="text-xl font-bold mb-2">Profile Settings</h2>
              <p className="text-gray-600">
                Update your personal information here.
              </p>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-white p-6 rounded shadow border">
              <h2 className="text-xl font-bold mb-2">Notification Settings</h2>
              <p className="text-gray-600">
                Manage your notification preferences.
              </p>
            </div>
          )}

          {/* Category */}
          {activeTab === "category" && (
            <div className="bg-white p-6 rounded shadow border">
              <h2 className="text-xl font-bold mb-4">Category Management</h2>

              {/* Toggle */}
              <div className="flex space-x-6 mb-4 border-b pb-2">
                <button
                  onClick={() => setActiveSection("income")}
                  className={`${
                    activeSection === "income"
                      ? "border-b-2 border-blue-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  Income Categories
                </button>
                <button
                  onClick={() => setActiveSection("expenses")}
                  className={`${
                    activeSection === "expenses"
                      ? "border-b-2 border-blue-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  Expenses Categories
                </button>
              </div>

              {/* Category List */}
              <div className="space-y-2">
                {activeSection === "income" &&
                  incomeCategories.map((cat, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-3 h-3 rounded-full ${cat.color}`}
                        ></span>
                        <span>{cat.name}</span>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEditClick(cat, i, "income")}
                        >
                          <FaEdit className="text-black cursor-pointer" />
                        </button>
                        <button
                          onClick={() =>
                            setIncomeCategories(
                              incomeCategories.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          <FaTimes className="text-black cursor-pointer" />
                        </button>
                      </div>
                    </div>
                  ))}

                {activeSection === "expenses" &&
                  expenseCategories.map((cat, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-3 h-3 rounded-full ${cat.color}`}
                        ></span>
                        <span>{cat.name}</span>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEditClick(cat, i, "expenses")}
                        >
                          <FaEdit className="text-black cursor-pointer" />
                        </button>
                        <button
                          onClick={() =>
                            setExpenseCategories(
                              expenseCategories.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          <FaTimes className="text-black cursor-pointer" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add Category Button */}
              <div className="mt-6">
                <button
                  onClick={handleAddClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Add New Category
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">
              {editIndex !== null ? "Edit Category" : "Add New Category"}
            </h3>

            {/* Category Name */}
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            {/* Category Type */}
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
              disabled={editIndex !== null} // prevent changing type while editing
            >
              <option value="income">Income</option>
              <option value="expenses">Expenses</option>
            </select>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
