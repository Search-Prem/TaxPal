import { useState, useEffect } from "react";
import { PlusCircle, Trash } from "lucide-react";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [health, setHealth] = useState([]); // ✅ Store budget health results
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Budget form state
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetMonth, setBudgetMonth] = useState("");
  const [budgetDescription, setBudgetDescription] = useState("");

  // ✅ Fetch budgets + budget health
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // get budgets
        const res = await fetch("http://localhost:5001/budgets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch budgets");
        const data = await res.json();
        setBudgets(data);

        // get budget health
        const healthRes = await fetch("http://localhost:5001/budgets/check", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setHealth(healthData);
        }
      } catch (err) {
        console.error("Error fetching budgets:", err);
      }
    };

    fetchBudgets();
  }, []);

  // ✅ Create budget
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
      const res = await fetch("http://localhost:5001/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newBudget),
      });

      if (!res.ok) throw new Error("Failed to create budget");

      const data = await res.json();
      setBudgets([...budgets, data]);

      // Reset form
      setBudgetCategory("");
      setBudgetAmount("");
      setBudgetMonth("");
      setBudgetDescription("");
      setShowBudgetModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Delete budget
  const deleteBudget = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`http://localhost:5001/budgets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setBudgets(budgets.filter((b) => b._id !== id));
      setHealth(health.filter((h) => h.budgetId !== id)); // remove health check too
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <button
          onClick={() => setShowBudgetModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <PlusCircle size={18} />
          Create New Budget
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {budgets.map((budget) => {
          const status = health.find(
            (h) => h.category === budget.category && h.month === budget.month
          );
          return (
            <div
              key={budget._id}
              className="relative bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-blue-600">{budget.category}</h2>
                <button
                  onClick={() => deleteBudget(budget._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-500">Monthly Budget</p>
              <p className="text-lg font-bold">₹{budget.budgetAmount}</p>
              <p className="text-sm text-gray-500 mt-2">Month</p>
              <p className="text-base font-semibold">{budget.month}</p>
              {budget.description && (
                <>
                  <p className="text-sm text-gray-500 mt-2">Description</p>
                  <p className="text-base">{budget.description}</p>
                </>
              )}

              {/* ✅ Budget Health Section */}
              {status && (
                <div className="mt-4 p-2 rounded-lg text-center font-medium"
                  style={{
                    backgroundColor: status.status === "Within Budget" ? "#dcfce7" : "#fee2e2",
                    color: status.status === "Within Budget" ? "#166534" : "#991b1b",
                  }}
                >
                  {status.status} (Spent: ₹{status.spent} / Remaining: ₹{status.remaining})
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal (unchanged) */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
            <h2 className="text-xl font-semibold mb-6">Create New Budget</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createBudget();
              }}
              className="grid grid-cols-2 gap-6"
            >
              <div>
                <label className="block font-medium mb-1">Category</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Groceries"
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Budget Amount</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  placeholder="₹ 0.00"
                  min="0"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Month</label>
                <input
                  type="month"
                  className="w-full border rounded px-3 py-2"
                  value={budgetMonth}
                  onChange={(e) => setBudgetMonth(e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                  placeholder="Add any details..."
                  value={budgetDescription}
                  onChange={(e) => setBudgetDescription(e.target.value)}
                />
              </div>

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
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
