import { useState, useEffect } from "react";
import { Trash } from "lucide-react";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [health, setHealth] = useState([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // Budget form state
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetMonth, setBudgetMonth] = useState("");
  const [budgetDescription, setBudgetDescription] = useState("");

  // Expense categories from Settings
  const [expenseCategories, setExpenseCategories] = useState([]);

  // Load expense categories from Settings
  const loadExpenseCategories = () => {
    try {
      const storedCategories = JSON.parse(
        localStorage.getItem("expenseCategories")
      );

      if (Array.isArray(storedCategories)) {
        setExpenseCategories(storedCategories);
      } else {
        setExpenseCategories([]);
      }
    } catch (error) {
      console.error("Error loading expense categories:", error);
      setExpenseCategories([]);
    }
  };

  // Fetch budgets and budget health
  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/budgets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch budgets");
      }

      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  const fetchBudgetHealth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const healthRes = await fetch("/api/budgets/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!healthRes.ok) {
        throw new Error("Failed to fetch budget health");
      }

      const healthData = await healthRes.json();
      setHealth(healthData);
    } catch (err) {
      console.error("Error fetching budget health:", err);
    }
  };

  // Initial load
  useEffect(() => {
    loadExpenseCategories();
    fetchBudgets();
    fetchBudgetHealth();
  }, []);

  // Open modal
  const openBudgetModal = () => {
    // Get latest categories from Settings
    loadExpenseCategories();

    setBudgetCategory("");
    setBudgetAmount("");
    setBudgetMonth("");
    setBudgetDescription("");

    setShowBudgetModal(true);
  };

  // Create budget
  const createBudget = async () => {
    if (!budgetCategory || !budgetMonth || !budgetAmount) {
      alert("Please fill all required fields");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    const newBudget = {
      category: budgetCategory,
      budgetAmount: Number(budgetAmount),
      month: budgetMonth,
      description: budgetDescription,
    };

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBudget),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        throw new Error(
          errorData.error || "Failed to create budget"
        );
      }

      const data = await res.json();

      setBudgets((prev) => [...prev, data]);

      // Refresh health immediately
      await fetchBudgetHealth();

      // Reset form
      setBudgetCategory("");
      setBudgetAmount("");
      setBudgetMonth("");
      setBudgetDescription("");
      setShowBudgetModal(false);
    } catch (err) {
      console.error("Create budget error:", err);
      alert(err.message || "Failed to create budget");
    }
  };

  // Delete budget
  const deleteBudget = async (id) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        throw new Error(
          errorData.error || "Failed to delete budget"
        );
      }

      setBudgets((prev) =>
        prev.filter((budget) => budget._id !== id)
      );

      setHealth((prev) =>
        prev.filter((item) => item.budgetId !== id)
      );

      await fetchBudgetHealth();
    } catch (err) {
      console.error("Delete budget error:", err);
      alert(err.message || "Failed to delete budget");
    }
  };

  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budgets</h1>

        <button
          onClick={openBudgetModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Budget
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {budgets.map((budget) => {
          const status = health.find(
            (h) =>
              h.budgetId === budget._id ||
              (h.category === budget.category &&
                h.month === budget.month)
          );

          return (
            <div
              key={budget._id}
              className="relative bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-blue-600">
                  {budget.category}
                </h2>

                <button
                  onClick={() =>
                    setShowDeleteModal(budget._id)
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Monthly Budget
              </p>

              <p className="text-lg font-bold">
                ₹{Number(budget.budgetAmount).toLocaleString()}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Month
              </p>

              <p className="text-base font-semibold">
                {budget.month}
              </p>

              {budget.description && (
                <>
                  <p className="text-sm text-gray-500 mt-2">
                    Description
                  </p>

                  <p className="text-base">
                    {budget.description}
                  </p>
                </>
              )}

              {/* Budget Health */}
              {status && (
                <div
                  className="mt-4 p-2 rounded-lg text-center font-medium"
                  style={{
                    backgroundColor:
                      status.status === "Within Budget"
                        ? "#dcfce7"
                        : "#fee2e2",

                    color:
                      status.status === "Within Budget"
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  <div>{status.status}</div>

                  <div className="text-sm mt-1">
                    Spent: ₹
                    {Number(
                      status.totalExpense ?? status.spent ?? 0
                    ).toLocaleString()}
                  </div>

                  <div className="text-sm">
                    Remaining: ₹
                    {Number(status.remaining ?? 0).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">
              Confirm Delete
            </h2>

            <p className="mb-6">
              Are you sure you want to delete this budget item?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  const id = showDeleteModal;

                  setShowDeleteModal(null);

                  await deleteBudget(id);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
            <h2 className="text-xl font-semibold mb-6">
              Create New Budget
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createBudget();
              }}
              className="grid grid-cols-2 gap-6"
            >
              {/* Category */}
              <div>
                <label className="block font-medium mb-1">
                  Expense Category
                </label>

                <select
                  value={budgetCategory}
                  onChange={(e) =>
                    setBudgetCategory(e.target.value)
                  }
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">
                    Select expense category
                  </option>

                  {expenseCategories.map((category) => (
                    <option
                      key={category.name}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                {expenseCategories.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    No expense categories available.
                    Add one in Settings → Category.
                  </p>
                )}
              </div>

              {/* Budget Amount */}
              <div>
                <label className="block font-medium mb-1">
                  Budget Amount
                </label>

                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  placeholder="₹ 0.00"
                  min="0"
                  value={budgetAmount}
                  onChange={(e) =>
                    setBudgetAmount(e.target.value)
                  }
                  required
                />
              </div>

              {/* Month */}
              <div>
                <label className="block font-medium mb-1">
                  Month
                </label>

                <input
                  type="month"
                  className="w-full border rounded px-3 py-2"
                  value={budgetMonth}
                  onChange={(e) =>
                    setBudgetMonth(e.target.value)
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block font-medium mb-1">
                  Description
                </label>

                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                  placeholder="Add any details..."
                  value={budgetDescription}
                  onChange={(e) =>
                    setBudgetDescription(e.target.value)
                  }
                />
              </div>

              {/* Buttons */}
              <div className="col-span-2 flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={expenseCategories.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Create Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}