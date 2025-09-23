import { useState } from "react";
import { FileText, FileSpreadsheet, ClipboardList, X } from "lucide-react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Report() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedItem, setSelectedItem] = useState(null); // <-- for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Monthly Data
  const financialData = [
    { month: "Jul 2024", income: 125000, expense: 100000 },
    { month: "Aug 2024", income: 125000, expense: 100000 },
    { month: "Sep 2024", income: 125000, expense: 100000 },
    { month: "Oct 2024", income: 125000, expense: 100000 },
    { month: "Nov 2024", income: 125000, expense: 100000 },
    { month: "Dec 2025", income: 125000, expense: 100000 },
  ];

  // Quarterly Data
  const quarterlyData = [
    { quarter: "Q1 2024", income: 375000, expense: 300000 },
    { quarter: "Q2 2024", income: 390000, expense: 310000 },
    { quarter: "Q3 2024", income: 400000, expense: 320000 },
    { quarter: "Q4 2024", income: 410000, expense: 330000 },
  ];

  // 📄 Generate PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Annual Report", 20, 20);

    let y = 40;
    financialData.forEach((item) => {
      doc.text(
        `${item.month} | Income: ₹${item.income} | Expense: ₹${item.expense} | Net: ₹${item.income - item.expense}`,
        20,
        y
      );
      y += 10;
    });

    y += 20;
    doc.text("Quarterly Summary:", 20, y);
    y += 10;
    quarterlyData.forEach((item) => {
      doc.text(
        `${item.quarter} | Income: ₹${item.income} | Expense: ₹${item.expense} | Net: ₹${item.income - item.expense}`,
        20,
        y
      );
      y += 10;
    });

    doc.save("Annual_Report.pdf");
  };

  // 📊 Generate Excel
  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const monthlySheet = XLSX.utils.json_to_sheet(financialData);
    const quarterlySheet = XLSX.utils.json_to_sheet(quarterlyData);

    XLSX.utils.book_append_sheet(wb, monthlySheet, "Monthly");
    XLSX.utils.book_append_sheet(wb, quarterlySheet, "Quarterly");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Annual_Report.xlsx");
  };

  // 📌 Open Modal
  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // 📌 Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-bold">Reports & Export</h1>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <FileText className="w-4 h-4" />
          Download Annual Report (PDF)
        </button>
        <button
          onClick={downloadExcel}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Download Annual Report (Excel)
        </button>
      </div>

      {/* Tabs */}
      <div className="w-full">
        <div className="grid grid-cols-2 w-1/2 bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "monthly" ? "bg-white shadow" : "text-gray-600"
            }`}
          >
            Monthly Summaries
          </button>
          <button
            onClick={() => setActiveTab("quarterly")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "quarterly" ? "bg-white shadow" : "text-gray-600"
            }`}
          >
            Quarterly Summaries
          </button>
        </div>

        {/* Monthly Summaries */}
        {activeTab === "monthly" && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Financial Summaries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {financialData.map((item, idx) => {
                const net = item.income - item.expense;
                return (
                  <div
                    key={idx}
                    className="border rounded-2xl shadow-md p-4 space-y-3"
                  >
                    <h3 className="text-md font-semibold">{item.month}</h3>
                    <p className="text-gray-500 text-sm">Financial overview</p>
                    <div className="space-y-1 text-sm">
                      <p>
                        Income:{" "}
                        <span className="text-green-600 font-semibold">
                          ₹{item.income.toLocaleString()}
                        </span>
                      </p>
                      <p>
                        Expense:{" "}
                        <span className="text-red-600 font-semibold">
                          ₹{item.expense.toLocaleString()}
                        </span>
                      </p>
                      <p>
                        Net Savings:{" "}
                        <span className="text-blue-600 font-semibold">
                          ₹{net.toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => openModal(item)}
                      className="flex items-center justify-center gap-2 border border-gray-400 rounded-lg w-full py-2 hover:bg-gray-100"
                    >
                      <ClipboardList className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quarterly Summaries */}
        {activeTab === "quarterly" && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Quarterly Summaries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quarterlyData.map((item, idx) => {
                const net = item.income - item.expense;
                return (
                  <div
                    key={idx}
                    className="border rounded-2xl shadow-md p-4 space-y-3"
                  >
                    <h3 className="text-md font-semibold">{item.quarter}</h3>
                    <p className="text-gray-500 text-sm">Financial overview</p>
                    <div className="space-y-1 text-sm">
                      <p>
                        Income:{" "}
                        <span className="text-green-600 font-semibold">
                          ₹{item.income.toLocaleString()}
                        </span>
                      </p>
                      <p>
                        Expense:{" "}
                        <span className="text-red-600 font-semibold">
                          ₹{item.expense.toLocaleString()}
                        </span>
                      </p>
                      <p>
                        Net Savings:{" "}
                        <span className="text-blue-600 font-semibold">
                          ₹{net.toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => openModal(item)}
                      className="flex items-center justify-center gap-2 border border-gray-400 rounded-lg w-full py-2 hover:bg-gray-100"
                    >
                      <ClipboardList className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 📌 Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 relative">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <h2 className="text-xl font-bold mb-4">
              {selectedItem.month || selectedItem.quarter} - Details
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Income:</strong>{" "}
                <span className="text-green-600">
                  ₹{selectedItem.income.toLocaleString()}
                </span>
              </p>
              <p>
                <strong>Expense:</strong>{" "}
                <span className="text-red-600">
                  ₹{selectedItem.expense.toLocaleString()}
                </span>
              </p>
              <p>
                <strong>Net Savings:</strong>{" "}
                <span className="text-blue-600">
                  ₹{(selectedItem.income - selectedItem.expense).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
