import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = "";

const TAX_YEAR = "2026-27";

const INSTALLMENTS = [
  {
    quarter: "Q1",
    dueDate: "2026-06-15",
    cumulativePercentage: 15,
    installmentPercentage: 15,
    reminderDate: "2026-06-08",
  },
  {
    quarter: "Q2",
    dueDate: "2026-09-15",
    cumulativePercentage: 45,
    installmentPercentage: 30,
    reminderDate: "2026-09-08",
  },
  {
    quarter: "Q3",
    dueDate: "2026-12-15",
    cumulativePercentage: 75,
    installmentPercentage: 30,
    reminderDate: "2026-12-08",
  },
  {
    quarter: "Q4",
    dueDate: "2027-03-15",
    cumulativePercentage: 100,
    installmentPercentage: 25,
    reminderDate: "2027-03-08",
  },
];

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatDate = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const getStatus = (installment, payment) => {
  if (payment?.[installment.quarter] === true) {
    return "paid";
  }

  const today = new Date();
  const dueDate = new Date(`${installment.dueDate}T23:59:59`);

  if (today > dueDate) {
    return "overdue";
  }

  return "upcoming";
};

export default function TaxCalendar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [taxPayment, setTaxPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchPayment = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/taxPayment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        setTaxPayment(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch tax payment information.");
      }

      const data = await response.json();
      setTaxPayment(data);
    } catch (error) {
      console.error("Tax calendar fetch error:", error);
      toast.error("Unable to load tax payment information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchPayment();
  }, []);

  const totalEstimatedTax = Number(taxPayment?.estimatedTax || 0);

  const installments = useMemo(() => {
    return INSTALLMENTS.map((installment) => {
      const amount =
        (totalEstimatedTax * installment.installmentPercentage) / 100;

      const cumulativeAmount =
        (totalEstimatedTax * installment.cumulativePercentage) / 100;

      return {
        ...installment,
        amount,
        cumulativeAmount,
      };
    });
  }, [totalEstimatedTax]);

  const confirmPayment = async () => {
    if (!selectedQuarter) return;

    try {
      setUpdating(true);

      const response = await fetch(
        `${API_URL}/api/taxPayment/${selectedQuarter}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paid: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update payment status.");
      }

      setTaxPayment(data.payment);

      setShowModal(false);
      setSelectedQuarter(null);

      toast.success(`${selectedQuarter} payment marked as paid.`);
    } catch (error) {
      console.error("Tax payment update error:", error);
      toast.error(error.message || "Unable to update payment status.");
    } finally {
      setUpdating(false);
    }
  };

  const openPaymentModal = (quarter) => {
    setSelectedQuarter(quarter);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-xl px-6 py-5">
          <p className="text-gray-600">Loading tax calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-2xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Tax Calendar
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Advance tax schedule for FY {TAX_YEAR}
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 hover:text-black text-xl font-bold"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* No tax estimate */}
          {!taxPayment ? (
            <div className="border border-yellow-200 bg-yellow-50 rounded-xl p-5">
              <h2 className="font-semibold text-yellow-800">
                No tax estimate available
              </h2>

              <p className="text-sm text-yellow-700 mt-2">
                Calculate your tax estimate first. TaxPal will then use that
                estimate to show your advance-tax schedule.
              </p>

              <button
                onClick={() => navigate("/tax-estimator")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Tax Estimator
              </button>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="border rounded-xl p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Estimated Annual Tax
                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {formatCurrency(totalEstimatedTax)}
                  </p>
                </div>

                <div className="border rounded-xl p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Tax Year
                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {TAX_YEAR}
                  </p>
                </div>

                <div className="border rounded-xl p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Payment Status
                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {
                      installments.filter(
                        (item) => taxPayment?.[item.quarter] === true
                      ).length
                    }
                    /4
                  </p>
                </div>
              </div>

              {/* Information */}
              <div className="mb-6 border border-blue-200 bg-blue-50 rounded-xl p-4">
                <h2 className="font-semibold text-blue-800">
                  Advance Tax Schedule
                </h2>

                <p className="text-sm text-blue-700 mt-1">
                  Payments are shown according to the cumulative advance-tax
                  schedule: 15%, 45%, 75%, and 100% of the estimated annual
                  tax.
                </p>

                <p className="text-xs text-blue-600 mt-2">
                  TaxPal currently bases this schedule on your estimated tax.
                  Your actual advance-tax liability may differ depending on
                  TDS and other tax credits.
                </p>
              </div>

              {/* Installments */}
              <div className="space-y-5">
                {installments.map((installment) => {
                  const status = getStatus(installment, taxPayment);

                  return (
                    <div
                      key={installment.quarter}
                      className="border rounded-xl p-5 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold text-gray-800">
                              {installment.quarter} Advance Tax
                            </h2>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                status === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : status === "overdue"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {status === "paid"
                                ? "Paid"
                                : status === "overdue"
                                ? "Overdue"
                                : "Upcoming"}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mt-1">
                            Due on {formatDate(installment.dueDate)}
                          </p>

                          <p className="text-sm text-gray-600 mt-3">
                            Installment:{" "}
                            <strong>
                              {installment.installmentPercentage}%
                            </strong>{" "}
                            of estimated annual tax
                          </p>

                          <p className="text-sm text-gray-600">
                            Cumulative target:{" "}
                            <strong>
                              {installment.cumulativePercentage}%
                            </strong>
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-sm text-gray-500">
                            Estimated payment
                          </p>

                          <p className="text-xl font-bold text-gray-800">
                            {formatCurrency(installment.amount)}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            Cumulative:{" "}
                            {formatCurrency(installment.cumulativeAmount)}
                          </p>

                          {status !== "paid" && (
                            <button
                              onClick={() =>
                                openPaymentModal(installment.quarter)
                              }
                              className={`mt-3 px-4 py-2 rounded-lg text-white ${
                                status === "overdue"
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 px-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Payment
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Have you actually made the {selectedQuarter} advance-tax
              payment?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedQuarter(null);
                }}
                disabled={updating}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                No
              </button>

              <button
                onClick={confirmPayment}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? "Updating..." : "Yes, I Paid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}