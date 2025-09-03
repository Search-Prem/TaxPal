import React from 'react';
import { FaTachometerAlt, FaBook, FaPiggyBank, FaCalculator, FaChartBar } from 'react-icons/fa';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt /> },
    { name: 'Logs', icon: <FaBook /> },
    { name: 'Budgeting', icon: <FaPiggyBank /> },
    { name: 'Tax Estimator', icon: <FaCalculator /> },
    { name: 'Report', icon: <FaChartBar /> },
  ];

  const email = localStorage.getItem("email") || "guest@example.com";
const username = email.split("@")[0];

  return (
    <aside className="w-64 bg-white flex flex-col justify-between h-screen border-r">
      {/* Sidebar menu */}
      <nav className="mt-6">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="px-6 py-2">
              <a
                href="#"
                className={`flex items-center p-3 rounded-lg font-medium transition-colors duration-200 ${
                  item.name === 'Dashboard'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-4">{item.icon}</span>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile Section at bottom */}
      <div className="flex items-center p-4 border-t">
        <img
          src="/profile-icon.png"
          alt="Profile"
          className="h-8 w-8 rounded-full border mr-3"
        />
        <span className="text-gray-700 font-medium">{username}</span>
      </div>
    </aside>
  );
};

export default Sidebar;
