import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import Features from "./pages/Features.jsx";
import Pricing from "./pages/Pricing.jsx";
import Support from "./pages/Support.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Logs from "./pages/Logs.jsx";
import Budgeting from "./pages/Budgeting.jsx";
import TaxEstimator from "./pages/TaxEstimator.jsx";
import Report from "./pages/Report.jsx";
import Category from "./pages/Category.jsx";
// Components
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("storage"));
  };

  // ✅ Layout for private pages (Header + Sidebar + Content)
  const PrivateLayout = ({ children }) => (
    <div className="flex min-h-screen bg-gray-100 pt-16">
      <Sidebar />
      <main className="flex-1 ml-56 p-6">{children}</main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/support" element={<Support />} />

        {/* Private routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <PrivateLayout>
                <Dashboard />
              </PrivateLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/logs"
          element={
            isAuthenticated ? (
              <PrivateLayout>
                <Logs />
              </PrivateLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/budgeting"
          element={
            isAuthenticated ? (
              <PrivateLayout>
                <Budgeting />
              </PrivateLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/tax-estimator"
          element={
            isAuthenticated ? (
              <PrivateLayout>
                <TaxEstimator />
              </PrivateLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route        
          path="/category"      
          element={       
            isAuthenticated ? (
              <PrivateLayout>        
                <Category />        
                </PrivateLayout>           
                ) : (       
                <Navigate to="/" replace />       
              )    
            }
      />
        <Route
          path="/report"
          element={
            isAuthenticated ? (
              <PrivateLayout>
                <Report />
              </PrivateLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
