// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.login(formData.username, formData.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1EFE9] p-4 font-sans">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-sm border border-[#E5E1D6]">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-display text-[#1A1A1A] mb-1">
            Sign in
          </h2>
          <p className="text-[#8C8A80] text-sm">Welcome back to LockedIn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-[#8C8A80] uppercase tracking-wide mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="block w-full px-3 py-2.5 border border-[#E5E1D6] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/40 focus:border-[#FF5A1F] bg-white text-sm"
              style={{ color: "#1A1A1A" }}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-[#8C8A80] uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="block w-full px-3 py-2.5 border border-[#E5E1D6] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/40 focus:border-[#FF5A1F] bg-white text-sm"
              style={{ color: "#1A1A1A" }}
            />
          </div>

          {error && (
            <div className="text-[#B4392A] text-sm text-center bg-[#FBEAE7] p-3 rounded-xl border border-[#EEC5BC]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-white bg-[#141414] hover:bg-black font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className="text-center">
            <Link to="/register" className="text-[#FF5A1F] hover:opacity-80 text-sm font-medium">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;