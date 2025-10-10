import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function TaxCalendar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [taxPayment, setTaxPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(null);

  // Fetch user tax payment record from backend
  const fetchPayment = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/taxPayment", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTaxPayment(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, []);

  // --- Calendar events
  const events = [
    {
      id: 1,
      title: "Reminder : Q1 Estimated Tax Payment",
      date: "June 1, 2025",
      description:
        "Reminder for updating Q1 estimated tax payment due on June 15, 2025",
      type: "reminder",
      month: "June, 2025",
    },
    {
      id: 2,
      title: "Q1 Estimated Tax Payment",
      date: "June 15, 2025",
      description: "Q1 estimated tax payment due (25% of total tax)",
      type: "payment",
      quarter: "Q1",
      dueDate: new Date("2025-06-15"),
      month: "June, 2025",
    },

    {
      id: 3,
      title: "Reminder : Q2 Estimated Tax Payment",
      date: "September 1, 2025",
      description:
        "Reminder for updating Q2 estimated tax payment due on September 15, 2025",
      type: "reminder",
      month: "September, 2025",
    },
    {
      id: 4,
      title: "Q2 Estimated Tax Payment",
      date: "September 15, 2025",
      description: "Q2 estimated tax payment due (50% of total tax, cumulative)",
      type: "payment",
      quarter: "Q2",
      dueDate: new Date("2025-09-15"),
      month: "September, 2025",
    },

    {
      id: 5,
      title: "Reminder : Q3 Estimated Tax Payment",
      date: "December 1, 2025",
      description:
        "Reminder for updating Q3 estimated tax payment due on December 15, 2025",
      type: "reminder",
      month: "December, 2025",
    },
    {
      id: 6,
      title: "Q3 Estimated Tax Payment",
      date: "December 15, 2025",
      description: "Q3 estimated tax payment due (75% of total tax, cumulative)",
      type: "payment",
      quarter: "Q3",
      dueDate: new Date("2025-12-15"),
      month: "December, 2025",
    },

    {
      id: 7,
      title: "Reminder : Q4 Estimated Tax Payment",
      date: "March 1, 2026",
      description:
        "Reminder for updating Q4 estimated tax payment due on March 15, 2026",
      type: "reminder",
      month: "March, 2026",
    },
    {
      id: 8,
      title: "Q4 Estimated Tax Payment",
      date: "March 15, 2026",
      description: "Q4 estimated tax payment due (100% of total tax)",
      type: "payment",
      quarter: "Q4",
      dueDate: new Date("2026-03-15"),
      month: "March, 2026",
    },
  ];

  // Group events by month
  const grouped = events.reduce((acc, ev) => {
    if (!acc[ev.month]) acc[ev.month] = [];
    acc[ev.month].push(ev);
    return acc;
  }, {});

  // --- Badge style for PAYMENT only
  const badgeStyle = (ev) => {
  if (!taxPayment) return "border-yellow-600 bg-yellow-500 text-white";

  const isPaid = taxPayment[ev.quarter];
  const isLate = new Date() > ev.dueDate && !isPaid;

  if (isPaid) return "border-green-600 bg-green-500 text-white";
  if (isLate) return "border-red-600 bg-red-500 text-white";
  return "border-orange-600 bg-orange-500 text-white";
};


  // --- Handle payment confirmation
  const confirmPayment = async () => {
    try {
      await fetch(
        `http://localhost:5001/api/taxPayment/${selectedQuarter}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paid: true }),
        }
      );
      setShowModal(false);
      setSelectedQuarter(null);
      fetchPayment(); // refresh data
      toast.success("Quaterly Tax Paid Successfully!!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-2xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Tax Calendar</h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 hover:text-black text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Events grouped by month */}
          <div className="space-y-6">
            {Object.keys(grouped).map((month) => (
              <div key={month}>
                <h2 className="text-gray-600 font-medium mb-3">{month}</h2>
                <div className="space-y-4">
                  {grouped[month].map((ev) => (
                    <div
                      key={ev.id}
                      className="shadow-md rounded-lg border p-4 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">{ev.title}</h3>
                        <p className="text-sm text-gray-500">{ev.date}</p>
                        <p className="text-sm text-gray-600">{ev.description}</p>
                        {/* Show amount only for payment */}
                        {ev.type === "payment" && taxPayment?.estimatedQuarterlyTaxes != null && (
                          <p className="text-sm text-gray-700 font-semibold mt-1">
                            Amount: ₹
                            {taxPayment.estimatedQuarterlyTaxes.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>

                      {ev.type === "reminder" ? (
                        // ✅ Reminder stays BLUE
                        <span className="border-2 border-blue-500 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold bg-white">
                          Reminder
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedQuarter(ev.quarter);
                            setShowModal(true);
                          }}
                          className={`border-2 px-3 py-1 rounded-full text-sm font-semibold  ${badgeStyle(
                            ev
                          )}`}
                        >
                          Payment
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center relative">
            <h3 className="text-lg font-semibold mb-4">Made the payment?</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={confirmPayment}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
