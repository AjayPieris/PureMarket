import React, { useState, useEffect } from "react";
import "../page_style/login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Show toast if redirected here after being blocked
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("blocked") === "1") {
      toast.error("Your account has been blocked by the admin.");
      // Clean the URL without reloading
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      const { data } = await axios.post(`${base}/api/auth/login`, form);

      // Expecting { token, user: { role: 'admin'|'vendor'|'user', ... } }
      const { token, user } = data || {};
      if (!token) throw new Error("Token missing in response");
      const role = (user?.role || "").toLowerCase();

      // Update auth context (persists token/role)
      login({ token, user, role });

      // Role-based redirect
      switch (role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "vendor":
          navigate("/vendor", { replace: true });
          break;
        case "user":
        default:
          navigate("/dashboard", { replace: true });
          break;
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="log-page" role="main">
      <header className="log-header">
        <img src={logo} alt="PureMarket" className="log-logo" />
        <h1 className="log-title">Welcome Back</h1>
        <p className="log-subtitle">Sign in to your account</p>
      </header>

      <form className="log-card" onSubmit={handleSubmit} noValidate>
        <label className="log-label center" htmlFor="email">Email</label>
        <div className="log-field">
          <span className="log-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6.75A1.75 1.75 0 014.75 5h14.5A1.75 1.75 0 0121 6.75v10.5A1.75 1.75 0 0119.25 19H4.75A1.75 1.75 0 013 17.25V6.75z" stroke="#9AA3AF" strokeWidth="1.5" />
              <path d="M4 7l8 5 8-5" stroke="#9AA3AF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            className="log-input"
            autoComplete="email"
            required
          />
        </div>

        <label className="log-label center" htmlFor="password">Password</label>
        <div className="log-field">
          <span className="log-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="10" width="16" height="10" rx="2" stroke="#9AA3AF" strokeWidth="1.5" />
              <path d="M8 10V8a4 4 0 118 0v2" stroke="#9AA3AF" strokeWidth="1.5" />
            </svg>
          </span>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className="log-input"
            autoComplete="current-password"
            required
          />
        </div>
        <div style={{ textAlign: "right", marginTop: "6px" }}>
          <a className="log-forgot" href="/forgot-password">Forgot password?</a>
        </div>


        <button type="submit" className="log-btn" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="log-muted">
          Don't have an account? <a className="log-link" href="/signup">Sign up</a>
        </p>
      </form>

      <a className="home-back" href="/">
        <span className="home-arrow" aria-hidden="true">←</span> Back to Home
      </a>
    </main>
  );
}