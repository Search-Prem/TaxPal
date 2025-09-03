import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Header({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const storedName = localStorage.getItem("name");
  const storedEmail = localStorage.getItem("email");
  const displayName =
    storedName || (storedEmail ? storedEmail.split("@")[0] : "User");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <h1
          className="text-xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
        >
          TaxPal
        </h1>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {!isAuthenticated ? (
            <nav className="flex items-center gap-6 text-gray-700">
              <Link to="/features" className="hover:text-blue-600">
                Features
              </Link>
              <Link to="/pricing" className="hover:text-blue-600">
                Pricing
              </Link>
              <Link to="/support" className="hover:text-blue-600">
                Support
              </Link>
            </nav>
          ) : (
            <div
              className="relative flex items-center gap-3"
              ref={dropdownRef}
            >
              <span className="font-medium text-gray-700 hidden sm:block">
                Hi, {displayName}
              </span>
              <button
                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                  )}&background=0D8ABC&color=fff`}
                  alt="profile"
                  className="w-8 h-8 rounded-full"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
