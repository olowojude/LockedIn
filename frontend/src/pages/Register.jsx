// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../utils/auth";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", first_name: "", last_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.register(formData);
      // Send new users to the welcome/onboarding screen first
      navigate("/welcome", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, type = "text", placeholder = "") => (
    <div key={id}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id} name={id} type={type}
        required={["username", "email", "password"].includes(id)}
        value={formData[id]}
        onChange={handleChange}
        placeholder={placeholder}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
        style={{ color: "#111827" }}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            Locked<span className="text-indigo-600">In</span>
          </h2>
          <p className="text-gray-500 text-sm">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field("first_name", "First Name", "text", "John")}
            {field("last_name",  "Last Name",  "text", "Doe")}
          </div>
          {field("username", "Username", "text",     "johndoe")}
          {field("email",    "Email",    "email",    "john@example.com")}
          {field("password", "Password", "password", "At least 8 characters")}

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {loading ? "Creating account…" : "Sign Up"}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;