import { useState, useEffect } from "react";
import { FileText, FileSpreadsheet, ClipboardList, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Report() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");

  // Financial Year
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");

  // Backend Data
  const [financialData, setFinancialData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    transactionCount: 0,
  });

  const [loading, setLoading] = useState(true);

  /*
    -------------------------------------------------------
    Fetch available financial years
    -------------------------------------------------------
  */
  useEffect(() => {
    const fetchFinancialYears = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No authentication token found.");
          return;
        }

        const res = await fetch("/api/reports/financial-years", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch financial years");
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid financial years response");
        }

        setFinancialYears(data);

        /*
          Backend returns the current FY and transaction FYs.
          Select the first/latest FY automatically.
        */
        if (data.length > 0) {
          setSelectedFinancialYear(data[0]);
        }
      } catch (error) {
        console.error("Error fetching financial years:", error);
      }
    };

    fetchFinancialYears();
  }, []);

  /*
    -------------------------------------------------------
    Fetch report data whenever FY changes
    -------------------------------------------------------
  */
  useEffect(() => {
    if (!selectedFinancialYear) {
      return;
    }

    const fetchReportData = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const query = `?financialYear=${encodeURIComponent(
          selectedFinancialYear
        )}`;

        /*
          Overall financial summary
        */
        const summaryRes = await fetch(
          `/api/reports/summary${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!summaryRes.ok) {
          throw new Error("Failed to fetch financial summary");
        }

        const summaryData = await summaryRes.json();

        setSummary({
          totalIncome: Number(summaryData.totalIncome || 0),
          totalExpense: Number(summaryData.totalExpense || 0),
          netSavings: Number(summaryData.netSavings || 0),
          transactionCount: Number(
            summaryData.transactionCount || 0
          ),
        });

        /*
          Monthly report
        */
        const monthlyRes = await fetch(
          `/api/reports/monthly${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!monthlyRes.ok) {
          throw new Error("Failed to fetch monthly reports");
        }

        const monthlyData = await monthlyRes.json();

        setFinancialData(
          Array.isArray(monthlyData) ? monthlyData : []
        );

        /*
          Quarterly report
        */
        const quarterlyRes = await fetch(
          `/api/reports/quarterly${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!quarterlyRes.ok) {
          throw new Error("Failed to fetch quarterly reports");
        }

        const quarterlyDataResponse = await quarterlyRes.json();

        setQuarterlyData(
          Array.isArray(quarterlyDataResponse)
            ? quarterlyDataResponse
            : []
        );

        /*
          Reset month/quarter filters when changing FY.
          Otherwise an old selection could remain active
          even though it doesn't belong to the new FY.
        */
        setSelectedMonth("");
        setSelectedQuarter("");
      } catch (error) {
        console.error("Error fetching report data:", error);

        setSummary({
          totalIncome: 0,
          totalExpense: 0,
          netSavings: 0,
          transactionCount: 0,
        });

        setFinancialData([]);
        setQuarterlyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedFinancialYear]);

  /*
    -------------------------------------------------------
    Apply filters
    -------------------------------------------------------
  */
  const filteredMonthlyData = selectedMonth
    ? financialData.filter(
        (item) => item.month === selectedMonth
      )
    : financialData;

  const filteredQuarterlyData = selectedQuarter
    ? quarterlyData.filter(
        (item) => item.quarter === selectedQuarter
      )
    : quarterlyData;

  /*
    -------------------------------------------------------
    PDF Export
    -------------------------------------------------------
  */
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Full page border
    doc.setDrawColor(0, 0, 0);
    doc.rect(
      5,
      5,
      doc.internal.pageSize.width - 10,
      doc.internal.pageSize.height - 10
    );

    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 20, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);

    doc.text(
      `Financial Report ${selectedFinancialYear}`,
      pageWidth / 2,
      16,
      {
        align: "center",
      }
    );

    doc.setTextColor(0, 0, 0);

    /*
      Monthly table
    */
    doc.setFontSize(14);

    doc.text(
      "Monthly Summaries",
      pageWidth / 2,
      40,
      {
        align: "center",
      }
    );

    autoTable(doc, {
      startY: 46,
      margin: {
        left: 25,
        right: 25,
      },

      styles: {
        halign: "center",
      },

      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },

      body: filteredMonthlyData.map((item) => [
        item.month,
        `INR ${Number(item.income || 0).toLocaleString(
          "en-IN"
        )}`,
        `INR ${Number(item.expense || 0).toLocaleString(
          "en-IN"
        )}`,
        `INR ${Number(item.net || 0).toLocaleString(
          "en-IN"
        )}`,
      ]),

      head: [
        [
          "Month",
          "Income",
          "Expense",
          "Net Savings",
        ],
      ],

      foot: [
        [
          "TOTAL",
          `INR ${filteredMonthlyData
            .reduce(
              (sum, item) =>
                sum + Number(item.income || 0),
              0
            )
            .toLocaleString("en-IN")}`,

          `INR ${filteredMonthlyData
            .reduce(
              (sum, item) =>
                sum + Number(item.expense || 0),
              0
            )
            .toLocaleString("en-IN")}`,

          `INR ${filteredMonthlyData
            .reduce(
              (sum, item) =>
                sum + Number(item.net || 0),
              0
            )
            .toLocaleString("en-IN")}`,
        ],
      ],

      footStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    /*
      Quarterly table
    */
    let finalY = doc.lastAutoTable.finalY + 15;

    doc.text(
      "Quarterly Summaries",
      pageWidth / 2,
      finalY,
      {
        align: "center",
      }
    );

    autoTable(doc, {
      startY: finalY + 6,

      margin: {
        left: 25,
        right: 25,
      },

      styles: {
        halign: "center",
      },

      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },

      body: filteredQuarterlyData.map((item) => [
        item.quarter,
        `INR ${Number(item.income || 0).toLocaleString(
          "en-IN"
        )}`,
        `INR ${Number(item.expense || 0).toLocaleString(
          "en-IN"
        )}`,
        `INR ${Number(item.net || 0).toLocaleString(
          "en-IN"
        )}`,
      ]),

      head: [
        [
          "Quarter",
          "Income",
          "Expense",
          "Net Savings",
        ],
      ],

      foot: [
        [
          "TOTAL",

          `INR ${filteredQuarterlyData
            .reduce(
              (sum, item) =>
                sum + Number(item.income || 0),
              0
            )
            .toLocaleString("en-IN")}`,

          `INR ${filteredQuarterlyData
            .reduce(
              (sum, item) =>
                sum + Number(item.expense || 0),
              0
            )
            .toLocaleString("en-IN")}`,

          `INR ${filteredQuarterlyData
            .reduce(
              (sum, item) =>
                sum + Number(item.net || 0),
              0
            )
            .toLocaleString("en-IN")}`,
        ],
      ],

      footStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    /*
      Page numbers
    */
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);

      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 30,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(
      `Annual_Report_${selectedFinancialYear}.pdf`
    );
  };

  /*
    -------------------------------------------------------
    Excel Export
    -------------------------------------------------------
  */
  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();

    const addINR = (data) =>
      data.map((item) => ({
        ...item,

        income: `INR ${Number(
          item.income || 0
        ).toLocaleString("en-IN")}`,

        expense: `INR ${Number(
          item.expense || 0
        ).toLocaleString("en-IN")}`,

        net: `INR ${Number(
          item.net || 0
        ).toLocaleString("en-IN")}`,
      }));

    const monthlySheet = XLSX.utils.json_to_sheet(
      filteredMonthlyData.length
        ? addINR(filteredMonthlyData)
        : addINR(financialData)
    );

    const quarterlySheet = XLSX.utils.json_to_sheet(
      filteredQuarterlyData.length
        ? addINR(filteredQuarterlyData)
        : addINR(quarterlyData)
    );

    XLSX.utils.book_append_sheet(
      wb,
      monthlySheet,
      "Monthly"
    );

    XLSX.utils.book_append_sheet(
      wb,
      quarterlySheet,
      "Quarterly"
    );

    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([wbout], {
        type: "application/octet-stream",
      }),
      `Annual_Report_${selectedFinancialYear}.xlsx`
    );
  };

  /*
    -------------------------------------------------------
    Modal
    -------------------------------------------------------
  */
  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  /*
    -------------------------------------------------------
    Loading
    -------------------------------------------------------
  */
  if (loading && !financialData.length && !quarterlyData.length) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <p className="text-gray-600">
            Loading financial report...
          </p>
        </div>
      </div>
    );
  }

  /*
    -------------------------------------------------------
    UI
    -------------------------------------------------------
  */
  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Reports & Export
      </h1>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Total Income
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            ₹
            {summary.totalIncome.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Total Expenses
          </p>

          <p className="text-2xl font-bold text-red-600 mt-1">
            ₹
            {summary.totalExpense.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Net Savings
          </p>

          <p
            className={`text-2xl font-bold mt-1 ${
              summary.netSavings >= 0
                ? "text-blue-600"
                : "text-red-600"
            }`}
          >
            ₹
            {summary.netSavings.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Transactions
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {summary.transactionCount}
          </p>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Financial Year */}
        <select
          value={selectedFinancialYear}
          onChange={(e) => {
            setSelectedFinancialYear(e.target.value);
          }}
          className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {financialYears.length === 0 && (
            <option value="">
              No Financial Year
            </option>
          )}

          {financialYears.map((year) => (
            <option
              key={year}
              value={year}
              className="text-black"
            >
              FY {year}
            </option>
          ))}
        </select>

        {/* Month */}
        {activeTab === "monthly" && (
          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value)
            }
            className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">
              All Months
            </option>

            {financialData.map((item) => (
              <option
                key={item.month}
                value={item.month}
                className="text-black"
              >
                {item.month}
              </option>
            ))}
          </select>
        )}

        {/* Quarter */}
        {activeTab === "quarterly" && (
          <select
            value={selectedQuarter}
            onChange={(e) =>
              setSelectedQuarter(e.target.value)
            }
            className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">
              All Quarters
            </option>

            {quarterlyData.map((item) => (
              <option
                key={item.quarter}
                value={item.quarter}
                className="text-black"
              >
                {item.quarter}
              </option>
            ))}
          </select>
        )}

        {/* PDF */}
        <button
          onClick={downloadPDF}
          disabled={!selectedFinancialYear}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg shadow"
        >
          <FileText className="w-4 h-4" />
          Download PDF
        </button>

        {/* Excel */}
        <button
          onClick={downloadExcel}
          disabled={!selectedFinancialYear}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg shadow"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Download Excel
        </button>
      </div>

      {/* Tabs */}
      <div className="w-full">
        <div className="grid grid-cols-2 w-1/2 bg-gray-200 rounded-lg p-1">

          <button
            onClick={() => {
              setActiveTab("monthly");
              setSelectedQuarter("");
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "monthly"
                ? "bg-white shadow"
                : "text-gray-600"
            }`}
          >
            Monthly Summaries
          </button>

          <button
            onClick={() => {
              setActiveTab("quarterly");
              setSelectedMonth("");
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "quarterly"
                ? "bg-white shadow"
                : "text-gray-600"
            }`}
          >
            Quarterly Summaries
          </button>
        </div>

        {/* Monthly Cards */}
        {activeTab === "monthly" && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredMonthlyData.map((item, idx) => (
              <div
                key={idx}
                className="border bg-white rounded-2xl shadow-md p-4 space-y-3"
              >
                <h3 className="text-md font-semibold">
                  {item.month}
                </h3>

                <p className="text-gray-500 text-sm">
                  Financial overview
                </p>

                <div className="space-y-1 text-sm">
                  <p>
                    Income:{" "}
                    <span className="text-green-600 font-semibold">
                      ₹
                      {Number(
                        item.income || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </p>

                  <p>
                    Expense:{" "}
                    <span className="text-red-600 font-semibold">
                      ₹
                      {Number(
                        item.expense || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </p>

                  <p>
                    Net Savings:{" "}
                    <span
                      className={`font-semibold ${
                        Number(item.net || 0) >= 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹
                      {Number(
                        item.net || 0
                      ).toLocaleString("en-IN")}
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
            ))}
          </div>
        )}

        {/* Quarterly Cards */}
        {activeTab === "quarterly" && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredQuarterlyData.map((item, idx) => (
              <div
                key={idx}
                className="border bg-white rounded-2xl shadow-md p-4 space-y-3"
              >
                <h3 className="text-md font-semibold">
                  {item.quarter}
                </h3>

                <p className="text-gray-500 text-sm">
                  Financial overview
                </p>

                <div className="space-y-1 text-sm">
                  <p>
                    Income:{" "}
                    <span className="text-green-600 font-semibold">
                      ₹
                      {Number(
                        item.income || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </p>

                  <p>
                    Expense:{" "}
                    <span className="text-red-600 font-semibold">
                      ₹
                      {Number(
                        item.expense || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </p>

                  <p>
                    Net Savings:{" "}
                    <span
                      className={`font-semibold ${
                        Number(item.net || 0) >= 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹
                      {Number(
                        item.net || 0
                      ).toLocaleString("en-IN")}
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
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

          <div className="bg-white rounded-xl shadow-lg p-6 w-96 relative">

            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {selectedItem.month ||
                selectedItem.quarter}{" "}
              - Details
            </h2>

            <div className="space-y-2 text-sm">

              <p>
                Income:{" "}
                <span className="text-green-600">
                  ₹
                  {Number(
                    selectedItem.income || 0
                  ).toLocaleString("en-IN")}
                </span>
              </p>

              <p>
                Expense:{" "}
                <span className="text-red-600">
                  ₹
                  {Number(
                    selectedItem.expense || 0
                  ).toLocaleString("en-IN")}
                </span>
              </p>

              <p>
                Net Savings:{" "}
                <span
                  className={
                    Number(selectedItem.net || 0) >= 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }
                >
                  ₹
                  {Number(
                    selectedItem.net || 0
                  ).toLocaleString("en-IN")}
                </span>
              </p>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}