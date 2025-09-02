import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBook,
  FaPiggyBank,
  FaCalculator,
  FaChartBar,
} from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { name: "Logs", icon: <FaBook />, path: "/logs" },
    { name: "Budgeting", icon: <FaPiggyBank />, path: "/budgeting" },
    { name: "Tax Estimator", icon: <FaCalculator />, path: "/tax-estimator" },
    { name: "Report", icon: <FaChartBar />, path: "/report" },
  ];

  return (
    <aside className="w-56 bg-white flex-shrink-0 hidden md:block border-r">
      <nav className="mt-6">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="px-4 py-2">
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
