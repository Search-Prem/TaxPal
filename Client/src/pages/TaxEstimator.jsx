import React, { useState } from "react";
import { FaUniversity, FaReceipt, FaTimes } from "react-icons/fa";
import { FiPercent } from "react-icons/fi";
import { BsFillFileEarmarkTextFill } from "react-icons/bs";

// ================= Component =================
export default function TaxEstimator() {
  const [region, setRegion] = useState("India");
  const [status, setStatus] = useState("Salaried");
  const [income, setIncome] = useState("");
  const [deductions, setDeductions] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [calculation, setCalculation] = useState(null);

  const incomeNum = Number.parseFloat(income) || 0;
  const deductionsNum = Number.parseFloat(deductions) || 0;

  // Values returned by the backend tax calculator
  const estimatedTax = calculation?.totalTax ?? null;
  const taxableIncome = calculation?.taxableIncome ?? null;

  const effectiveRate =
    calculation?.effectiveRate != null
      ? Number(calculation.effectiveRate).toFixed(1)
      : null;

  const token = localStorage.getItem("token");

  // ============================================================
  // Check whether the user already has a tax record
  // ============================================================
  const handleRecord = async () => {
    if (!token) {
      setNotification({
        type: "error",
        message: "User not authenticated",
      });
      return;
    }

    try {
      const res = await fetch(
        "https://taxpal-sj9u.onrender.com/taxRoutes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch existing tax records");
      }

      const data = await res.json();

      // Existing tax record found
      if (Array.isArray(data) && data.length > 0) {
        const record = data[0];

        setExistingRecord(record);

        /*
         * Existing TaxRecord currently stores estimatedQuarterlyTaxes.
         * The backend now calculates annual tax and returns totalTax
         * when a record is created/updated.
         *
         * For an older record, reconstruct the displayed annual estimate
         * from the stored quarterly amount.
         */
        const storedQuarterlyTax =
          Number(record.estimatedQuarterlyTaxes) || 0;

        const storedTaxableIncome =
          Number(record.taxableIncome) || 0;

        const storedAnnualTax = storedQuarterlyTax * 4;

        setCalculation({
          taxableIncome: storedTaxableIncome,
          totalTax: storedAnnualTax,
          effectiveRate:
            storedTaxableIncome > 0
              ? (storedAnnualTax / storedTaxableIncome) * 100
              : 0,
        });

        setShowEditModal(true);
        return;
      }

      // No existing record
      setShowModal(true);
    } catch (err) {
      console.error(
        "Error checking existing tax records:",
        err
      );

      setNotification({
        type: "error",
        message:
          "Error checking existing tax records.",
      });
    }
  };

  // ============================================================
  // Create / Update tax record
  // ============================================================
  const confirmRecord = async (update = false) => {
    try {
      // Validate annual income
      if (incomeNum <= 0) {
        setNotification({
          type: "error",
          message:
            "Please enter a valid annual income.",
        });
        return;
      }

      // Validate deductions
      if (deductionsNum < 0) {
        setNotification({
          type: "error",
          message:
            "Deductions cannot be negative.",
        });
        return;
      }

      if (deductionsNum > incomeNum) {
        setNotification({
          type: "error",
          message:
            "Deductions cannot exceed annual income.",
        });
        return;
      }

      if (!token) {
        setNotification({
          type: "error",
          message: "User not authenticated.",
        });
        return;
      }

      /*
       * IMPORTANT:
       * We send only the user's inputs.
       *
       * The backend calculates:
       * - standard deduction
       * - taxable income
       * - income tax
       * - rebate
       * - surcharge
       * - cess
       * - total tax
       * - effective rate
       */
      const payload = {
        annualIncome: incomeNum,
        deductions: deductionsNum,
        region,
        incomeType: status,
        isResident: true,
      };

      const url =
        update && existingRecord?._id
          ? `https://taxpal-sj9u.onrender.com/taxRoutes/${existingRecord._id}`
          : "https://taxpal-sj9u.onrender.com/taxRoutes";

      const method = update ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to calculate tax."
        );
      }

      // Store backend-generated calculation
      if (data.calculation) {
        setCalculation(data.calculation);
      }

      // Store database record
      if (data.record) {
        setExistingRecord(data.record);
      }

      setShowModal(false);
      setShowEditModal(false);

      setNotification({
        type: "success",
        message: update
          ? "Tax estimate updated successfully!"
          : "Tax estimate calculated successfully!",
      });
    } catch (error) {
      console.error(
        "Tax calculation error:",
        error
      );

      setNotification({
        type: "error",
        message:
          error.message ||
          "Unable to calculate tax.",
      });
    }
  };

  // ============================================================
  // Modal controls
  // ============================================================
  const closeModal = () => {
    setShowModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Tax Estimation
        </h1>

        <p className="text-gray-500">
          Estimate your tax liability based on your
          financial information and tax profile.
        </p>
      </div>

      {/* ======================================================
          Tax Profile
      ======================================================= */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Your Tax Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Tax Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tax Region
            </label>

            <select
              value={region}
              onChange={(e) =>
                setRegion(e.target.value)
              }
              className="mt-1 w-full border px-3 py-2 rounded-md"
            >
              <option value="India">
                India
              </option>
            </select>

            <p className="text-xs text-gray-500 mt-1">
              Current tax calculations are supported
              for India.
            </p>
          </div>

          {/* Income Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Income Type
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="mt-1 w-full border px-3 py-2 rounded-md"
            >
              <option value="Salaried">
                Salaried
              </option>

              <option value="Self-employed">
                Self-employed / Professional
              </option>

              <option value="Business">
                Business / Other
              </option>
            </select>
          </div>

        </div>
      </div>

      {/* ======================================================
          Financial Inputs
      ======================================================= */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">

        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Enter Your Financials
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Annual Income */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Annual Income (₹)
            </label>

            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={income}
              onChange={(e) =>
                setIncome(e.target.value)
              }
              placeholder="e.g. 600000"
              className="mt-1 w-full border px-3 py-2 rounded-md"
            />
          </div>

          {/* Deductions */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Deductions (₹)
            </label>

            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={deductions}
              onChange={(e) =>
                setDeductions(e.target.value)
              }
              placeholder="e.g. 150000"
              className="mt-1 w-full border px-3 py-2 rounded-md"
            />

            <p className="text-xs text-gray-500 mt-1">
              For salaried users, the applicable
              standard deduction is handled by the
              server.
            </p>
          </div>

        </div>

        {/* Record Button */}
        <button
          onClick={handleRecord}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Calculate & Record
        </button>

      </div>

      {/* ======================================================
          New Record Confirmation Modal
      ======================================================= */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">

          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center relative">

            <FaTimes
              className="absolute top-3 right-3 cursor-pointer text-gray-500"
              onClick={closeModal}
            />

            <h3 className="text-lg font-semibold mb-4">
              Confirmation
            </h3>

            <p className="mb-6">
              Calculate and record this tax estimate?
            </p>

            <div className="flex justify-center gap-4">

              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  confirmRecord(false)
                }
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Confirm
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          Existing Record Update Modal
      ======================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">

          <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center relative">

            <FaTimes
              className="absolute top-3 right-3 cursor-pointer text-gray-500"
              onClick={closeEditModal}
            />

            <h3 className="text-lg font-semibold mb-4">
              Existing Record Found
            </h3>

            <p className="mb-6">
              You already have a tax estimate recorded.
              Do you want to replace it with the values
              currently entered?
            </p>

            <div className="flex justify-center gap-4">

              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  confirmRecord(true)
                }
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Update
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          Notification
      ======================================================= */}
      {notification && (
        <div
          className={`fixed top-5 right-5 p-4 rounded shadow-md text-white ${
            notification.type === "success"
              ? "bg-green-500"
              : "bg-red-500"
          } flex items-center gap-2 z-50`}
        >

          <FaTimes
            className="cursor-pointer"
            onClick={closeNotification}
          />

          {notification.message}

        </div>
      )}

      {/* ======================================================
          Tax Summary
      ======================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Annual Tax */}
        <SummaryCard
          icon={
            <FaUniversity className="text-blue-500 text-2xl" />
          }
          title="Estimated Annual Tax"
          value={
            estimatedTax !== null
              ? `₹${Number(
                  estimatedTax
                ).toLocaleString("en-IN")}`
              : "—"
          }
          subtitle="Calculated by the server using the current tax rules."
        />

        {/* Effective Tax Rate */}
        <SummaryCard
          icon={
            <FiPercent className="text-indigo-500 text-2xl" />
          }
          title="Effective Tax Rate"
          value={
            effectiveRate !== null
              ? `${effectiveRate}%`
              : "—"
          }
          subtitle="Tax as a percentage of taxable income."
        />

        {/* Deductions */}
        <SummaryCard
          icon={
            <BsFillFileEarmarkTextFill className="text-green-500 text-2xl" />
          }
          title="Total Deductions"
          value={`₹${deductionsNum.toLocaleString(
            "en-IN"
          )}`}
          subtitle="Additional deductions entered for this estimate."
        />

        {/* Taxable Income */}
        <SummaryCard
          icon={
            <FaReceipt className="text-red-500 text-2xl" />
          }
          title="Taxable Income"
          value={
            taxableIncome !== null
              ? `₹${Number(
                  taxableIncome
                ).toLocaleString("en-IN")}`
              : "—"
          }
          subtitle="Income after applicable deductions."
        />

      </div>

    </div>
  );
}


// ============================================================
// Reusable Summary Card
// ============================================================
function SummaryCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-start">

      <div className="mb-2">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-gray-700">
        {title}
      </h3>

      <p className="text-2xl font-bold text-gray-900">
        {value}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        {subtitle}
      </p>

    </div>
  );
}