import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaFileInvoice, FaBook, FaCalculator, FaChartBar } from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/logs", label: "Logs", icon: <FaFileInvoice /> },
    { to: "/budgeting", label: "Budgeting", icon: <FaBook /> },
    { to: "/tax-estimator", label: "Tax Estimator", icon: <FaCalculator /> },
    { to: "/report", label: "Report", icon: <FaChartBar /> },
  ];

  return (
    <aside className="fixed top-16 left-0 h-full w-56 bg-white shadow-md">
      <nav className="mt-6 flex flex-col gap-2">
        {links.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              location.pathname === to ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
