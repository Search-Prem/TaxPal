import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { toast } from "react-toastify";

const countries = [
  "United States",
  "United Kingdom",
  "India",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
];

const pwRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
    income: "",
  });
  const [loading, setLoading] = useState(false);

  // generic change handler
  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!pwRegex.test(form.password)) {
      return toast.error(
        "Password must have 1 uppercase, 1 number, 1 special char, min 8 chars"
      );
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      toast.success("Registered! Redirecting to login...");
      setTimeout(() => nav("/"), 1500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
          <h1 className="text-2xl font-semibold text-center">Create Account</h1>
          <p className="text-gray-600 mt-1 text-center">
            Join TaxPal for professional tax management
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              name="name"
              value={form.name}
              onChange={change}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              name="email"
              value={form.email}
              onChange={change}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              name="password"
              value={form.password}
              onChange={change}
            />
            <p className="text-xs text-gray-500 -mt-2">
              Min 8 chars, 1 uppercase, 1 number, 1 special character.
            </p>

            <label className="block text-sm mb-1">Country</label>
            <select
              name="country"
              value={form.country}
              onChange={change}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>
                -- Select your country --
              </option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="block text-sm mb-1">Income bracket</label>
            <select
              name="income"
              value={form.income}
              onChange={change}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>
                -- Select your income bracket --
              </option>
              <option value="0-25k">0 - 25,000</option>
              <option value="25k-50k">25,000 - 50,000</option>
              <option value="50k-100k">50,000 - 100,000</option>
              <option value="100k-200k">100,000 - 200,000</option>
              <option value="200k+">200,000+</option>
            </select>

            <div className="md:col-span-2 flex items-start gap-3 mt-2">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                required
              />
              <p className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-blue-600">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600">
                  Privacy Policy
                </a>
              </p>
            </div>

            <div className="mt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{" "}
            <Link className="text-blue-600" to="/">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
