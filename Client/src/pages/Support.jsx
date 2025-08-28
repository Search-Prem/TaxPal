import React from "react";
import { useNavigate } from "react-router-dom";
export default function Support() {
    const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Support</h1>
      <p className="text-gray-600">
        Need help? Reach out to our support team at <a href="mailto:support@taxpal.com" className="text-blue-600 underline">taxpalteam2@gmail.com</a>.
      </p>
      <div className="text-center mt-12">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
    
  );
}
