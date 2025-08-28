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

  return (
    <aside className="w-64 bg-white flex-shrink-0 hidden md:block border-r">
      {/* <div className="h-20 flex items-center justify-center border-b">
        <div className="bg-blue-600 p-2 rounded-lg">
          <FaCalculator className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 ml-3">TaxPal</h1>
      </div> */}
      <nav className="mt-6">
        <ul>
          {menuItems.map((item, index) => (
            <li key={item.name} className="px-6 py-2">
              <a href="#" className={`flex items-center p-3 rounded-lg font-medium transition-colors duration-200 ${
                item.name === 'Dashboard' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
              }`}>
                <span className="mr-4">{item.icon}</span>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;