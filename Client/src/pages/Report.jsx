import { useState } from "react";
import { FileText, FileSpreadsheet, ClipboardList, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Report() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");

  // Financial data for full year
  const financialData = [
    { month: "Jan 2024", income: 120000, expense: 95000 },
    { month: "Feb 2024", income: 130000, expense: 100000 },
    { month: "Mar 2024", income: 125000, expense: 98000 },
    { month: "Apr 2024", income: 140000, expense: 105000 },
    { month: "May 2024", income: 135000, expense: 102000 },
    { month: "Jun 2024", income: 128000, expense: 99000 },
    { month: "Jul 2024", income: 125000, expense: 100000 },
    { month: "Aug 2024", income: 125000, expense: 100000 },
    { month: "Sep 2024", income: 125000, expense: 100000 },
    { month: "Oct 2024", income: 125000, expense: 100000 },
    { month: "Nov 2024", income: 125000, expense: 100000 },
    { month: "Dec 2024", income: 125000, expense: 100000 },
  ];

  const quarterlyData = [
    { quarter: "Q1 2024", income: 375000, expense: 300000 },
    { quarter: "Q2 2024", income: 403000, expense: 306000 },
    { quarter: "Q3 2024", income: 375000, expense: 300000 },
    { quarter: "Q4 2024", income: 375000, expense: 300000 },
  ];

  // Filtered Data
  const filteredMonthlyData = selectedMonth
    ? financialData.filter((item) => item.month === selectedMonth)
    : financialData;

  const filteredQuarterlyData = selectedQuarter
    ? quarterlyData.filter((item) => item.quarter === selectedQuarter)
    : quarterlyData;

  // PDF Generation
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");

    doc.setFontSize(18);
    doc.text("Annual Financial Report", 14, 20);

    doc.setFontSize(14);
    doc.text("Monthly Summaries", 14, 30);
    autoTable(doc, {
      startY: 34,
      head: [["Month", "Income", "Expense", "Net Savings"]],
      body: filteredMonthlyData.map((item) => [
        item.month,
        `$${item.income.toLocaleString()}`,
        `$${item.expense.toLocaleString()}`,
        `$${(item.income - item.expense).toLocaleString()}`,
      ]),
      foot: [
        [
          "TOTAL",
          `$${filteredMonthlyData.reduce((sum, i) => sum + i.income, 0).toLocaleString()}`,
          `$${filteredMonthlyData.reduce((sum, i) => sum + i.expense, 0).toLocaleString()}`,
          `$${filteredMonthlyData.reduce((sum, i) => sum + (i.income - i.expense), 0).toLocaleString()}`,
        ],
      ],
    });

    let finalY = doc.lastAutoTable.finalY + 12;
    doc.text("Quarterly Summaries", 14, finalY);
    autoTable(doc, {
      startY: finalY + 4,
      head: [["Quarter", "Income", "Expense", "Net Savings"]],
      body: filteredQuarterlyData.map((item) => [
        item.quarter,
        `$${item.income.toLocaleString()}`,
        `$${item.expense.toLocaleString()}`,
        `$${(item.income - item.expense).toLocaleString()}`,
      ]),
      foot: [
        [
          "TOTAL",
          `$${filteredQuarterlyData.reduce((sum, i) => sum + i.income, 0).toLocaleString()}`,
          `$${filteredQuarterlyData.reduce((sum, i) => sum + i.expense, 0).toLocaleString()}`,
          `$${filteredQuarterlyData.reduce((sum, i) => sum + (i.income - i.expense), 0).toLocaleString()}`,
        ],
      ],
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    doc.save("Annual_Report.pdf");
  };

  // Excel Generation
  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const addDollar = (data) =>
      data.map((item) => ({
        ...item,
        income: `$${item.income.toLocaleString()}`,
        expense: `$${item.expense.toLocaleString()}`,
        netSavings: `$${(item.income - item.expense).toLocaleString()}`,
      }));

    const monthlySheet = XLSX.utils.json_to_sheet(filteredMonthlyData.length ? addDollar(filteredMonthlyData) : addDollar(financialData));
    const quarterlySheet = XLSX.utils.json_to_sheet(filteredQuarterlyData.length ? addDollar(filteredQuarterlyData) : addDollar(quarterlyData));

    XLSX.utils.book_append_sheet(wb, monthlySheet, "Monthly");
    XLSX.utils.book_append_sheet(wb, quarterlySheet, "Quarterly");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Annual_Report.xlsx");
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Reports & Export</h1>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {activeTab === "monthly" && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none"
          >
            <option value="" className="text-black">All Months</option>
            {financialData.map((item) => (
              <option key={item.month} value={item.month} className="text-black">
                {item.month}
              </option>
            ))}
          </select>
        )}

        {activeTab === "quarterly" && (
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none"
          >
            <option value="" className="text-black">All Quarters</option>
            {quarterlyData.map((item) => (
              <option key={item.quarter} value={item.quarter} className="text-black">
                {item.quarter}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <FileText className="w-4 h-4" /> Download PDF
        </button>

        <button
          onClick={downloadExcel}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <FileSpreadsheet className="w-4 h-4" /> Download Excel
        </button>
      </div>

      {/* Tabs */}
      <div className="w-full">
        <div className="grid grid-cols-2 w-1/2 bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-2 rounded-md font-medium ${activeTab === "monthly" ? "bg-white shadow" : "text-gray-600"}`}
          >
            Monthly Summaries
          </button>
          <button
            onClick={() => setActiveTab("quarterly")}
            className={`px-4 py-2 rounded-md font-medium ${activeTab === "quarterly" ? "bg-white shadow" : "text-gray-600"}`}
          >
            Quarterly Summaries
          </button>
        </div>

        {/* Monthly Cards */}
        {activeTab === "monthly" && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMonthlyData.map((item, idx) => {
              const net = item.income - item.expense;
              return (
                <div key={idx} className="border bg-white rounded-2xl shadow-md p-4 space-y-3">
                  <h3 className="text-md font-semibold">{item.month}</h3>
                  <p className="text-gray-500 text-sm">Financial overview</p>
                  <div className="space-y-1 text-sm">
                    <p>Income: <span className="text-green-600 font-semibold">{`$${item.income.toLocaleString()}`}</span></p>
                    <p>Expense: <span className="text-red-600 font-semibold">{`$${item.expense.toLocaleString()}`}</span></p>
                    <p>Net Savings: <span className="text-blue-600 font-semibold">{`$${net.toLocaleString()}`}</span></p>
                  </div>
                  <button onClick={() => openModal(item)} className="flex items-center justify-center gap-2 border border-gray-400 rounded-lg w-full py-2 hover:bg-gray-100">
                    <ClipboardList className="w-4 h-4" /> View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Quarterly Cards */}
        {activeTab === "quarterly" && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuarterlyData.map((item, idx) => {
              const net = item.income - item.expense;
              return (
                <div key={idx} className="border bg-white rounded-2xl shadow-md p-4 space-y-3">
                  <h3 className="text-md font-semibold">{item.quarter}</h3>
                  <p className="text-gray-500 text-sm">Financial overview</p>
                  <div className="space-y-1 text-sm">
                    <p>Income: <span className="text-green-600 font-semibold">{`$${item.income.toLocaleString()}`}</span></p>
                    <p>Expense: <span className="text-red-600 font-semibold">{`$${item.expense.toLocaleString()}`}</span></p>
                    <p>Net Savings: <span className="text-blue-600 font-semibold">{`$${net.toLocaleString()}`}</span></p>
                  </div>
                  <button onClick={() => openModal(item)} className="flex items-center justify-center gap-2 border border-gray-400 rounded-lg w-full py-2 hover:bg-gray-100">
                    <ClipboardList className="w-4 h-4" /> View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 relative">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedItem.month || selectedItem.quarter} - Details</h2>
            <div className="space-y-2 text-sm">
              <p>Income: <span className="text-green-600">{`$${selectedItem.income.toLocaleString()}`}</span></p>
              <p>Expense: <span className="text-red-600">{`$${selectedItem.expense.toLocaleString()}`}</span></p>
              <p>Net Savings: <span className="text-blue-600">{`$${(selectedItem.income - selectedItem.expense).toLocaleString()}`}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
