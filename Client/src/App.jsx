import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import Features from "./pages/Features.jsx";
import Pricing from "./pages/Pricing.jsx";
import Support from "./pages/Support.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Logs from "./pages/Logs.jsx"; // ✅ added
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar.jsx";

// ✅ Navbar Component
function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token"); // check if token exists

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear token
    navigate("/"); // back to login
  };

  return (
    <div className="w-full border-b bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white">
            🧮
          </span>
          <span className="text-lg font-semibold">TaxPal</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <Link to="/features" className="hover:text-gray-900">
            Features
          </Link>
          <Link to="/pricing" className="hover:text-gray-900">
            Pricing
          </Link>
          <Link to="/support" className="hover:text-gray-900">
            Support
          </Link>

          {/* ✅ Only show Logout after login */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Main App Component
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />

        {/* Dashboard layout wrapper */}
        <Route
          path="/dashboard"
          element={
            <div className="flex h-screen bg-gray-100 font-sans">
              <Sidebar />
              <main className="flex-1 p-6 md:p-8 lg:p-10">
                <Dashboard />
              </main>
            </div>
          }
        />

        {/* ✅ Logs route with same layout */}
        <Route
          path="/logs"
          element={
            <div className="flex h-screen bg-gray-100 font-sans">
              <Sidebar />
              <main className="flex-1 p-6 md:p-8 lg:p-10">
                <Logs />
              </main>
            </div>
          }
        />

        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/support" element={<Support />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
