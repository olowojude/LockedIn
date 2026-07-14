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
      <label htmlFor={id} className="block text-xs font-semibold text-[#8C8A80] uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        id={id} name={id} type={type}
        required={["username", "email", "password"].includes(id)}
        value={formData[id]}
        onChange={handleChange}
        placeholder={placeholder}
        className="block w-full px-3 py-2.5 border border-[#E5E1D6] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/40 focus:border-[#FF5A1F] bg-white text-sm"
        style={{ color: "#1A1A1A" }}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1EFE9] p-4 font-sans">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-sm border border-[#E5E1D6]">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-display text-[#1A1A1A] mb-1">
            Locked<span className="text-[#FF5A1F]">In</span>
          </h2>
          <p className="text-[#8C8A80] text-sm">Create your account to get started</p>
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
            <div className="text-[#B4392A] text-sm text-center bg-[#FBEAE7] p-3 rounded-xl border border-[#EEC5BC]">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#141414] hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {loading ? "Creating account…" : "Sign Up"}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-[#FF5A1F] hover:opacity-80 text-sm font-medium">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;