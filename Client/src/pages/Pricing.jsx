import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$9/mo",
    features: ["Basic invoicing", "Up to 3 clients", "Email support"],
  },
  {
    name: "Pro",
    price: "$29/mo",
    features: ["Unlimited clients", "Analytics dashboard", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "$99/mo",
    features: [
      "Dedicated account manager",
      "Custom integrations",
      "24/7 support",
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <section className="py-28 bg-white min-h-[90vh]">
      <h2 className="text-3xl font-bold text-center mb-14">Pricing</h2>
      <div className="flex flex-wrap justify-center gap-10 max-w-6xl mx-auto">
        {plans.map((p, i) => (
          <div
            key={i}
            className="w-[280px] md:w-[300px] p-8 border rounded-3xl shadow-lg text-center flex flex-col"
          >
            <h3 className="font-semibold text-xl">{p.name}</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">{p.price}</p>

            <ul className="mt-6 space-y-3 flex-1 text-left">
              {p.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-500" size={20} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button className="mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
              Choose {p.name}
            </button>
          </div>
        ))}
      </div>

      {/* Back to Login button */}
      <div className="text-center mt-12">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Login
        </button>
      </div>
    </section>
  );
}
