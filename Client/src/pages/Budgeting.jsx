import { useState } from "react";
import { Pencil, PlusCircle, Trash } from "lucide-react";

export default function Categories() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Groceries", budget: 1234, spent: 124, type: "expense" },
    { id: 2, name: "Dining Out", budget: 0, spent: 0, type: "expense" },
    { id: 3, name: "Salary", budget: 50000, spent: 0, type: "income" },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState("expense");
  const [filter, setFilter] = useState("all");

  const saveName = (id) => {
    setCategories((cats) =>
      cats.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
    setEditingId(null);
  };

  const deleteCategory = (id) => {
    setCategories((cats) => cats.filter((c) => c.id !== id));
    setEditingId(null);
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setCategories((cats) => [
      ...cats,
      {
        id: Date.now(),
        name: newCategory,
        budget: 0,
        spent: 0,
        type: newType,
      },
    ]);
    setNewCategory("");
    setNewType("expense");
    setShowModal(false);
  };

  const filteredCategories =
    filter === "all"
      ? categories
      : categories.filter((cat) => cat.type === filter);

  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categorization & Budgeting</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Add New Category
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-6">
        {["all", "income", "expense"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded ${
              filter === type
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid of categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="relative bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition"
          >
            {/* Title row with edit */}
            <div className="flex justify-between items-center mb-3">
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    className="border px-2 py-1 rounded w-full"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveName(cat.id)}
                    autoFocus
                  />
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <h2
                    className={`font-semibold ${
                      cat.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {cat.name}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingId(cat.id);
                      setNewName(cat.name);
                    }}
                  >
                    <Pencil
                      size={16}
                      className="text-gray-500 hover:text-gray-700"
                    />
                  </button>
                </>
              )}
            </div>

            {/* Budget Info */}
            <p className="text-sm text-gray-500">Monthly Budget</p>
            <p className="text-lg font-bold">₹{cat.budget.toLocaleString()}</p>

            <p className="text-sm text-gray-500 mt-2">Spent</p>
            <p className="text-base font-semibold">₹{cat.spent.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Modal for Adding Category */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded mb-4"
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <select
              className="w-full border px-3 py-2 rounded mb-4"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}