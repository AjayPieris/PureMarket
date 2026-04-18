import React, { useState, useEffect } from "react";
import "../page_style/auth.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";
import { ArrowRight, ArrowLeft, Mail, Lock } from "lucide-react";

const BG_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDydt4uI7y7lr1W8idxf8IGYG6BEb0PCSUHWMwUqvXSF3bIVXzmwHeC3utzXQS4ksKJZVSTKELKBdV1icHxUTEfyjU4pxMrygMZEPzZmK7lnTD_aNEJ2i0ftCdYMHR_WFKsA7P_6z5M5W0y7QkP3SfTGUvxEIf9j1TYHq7X6TeSOBAONlF8kiuIy7pJNyt4CGQs45pI5CnBh8rTyALMidlS8SuwEEnWW_JQx2S3HMpFJ9IDN0J34_OkZ8Wb0iFxW7Y8pdSTHAerEbI";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("blocked") === "1") {
      toast.error("Your account has been blocked by the admin.");
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
      const { token, user } = data || {};
      if (!token) throw new Error("Token missing in response");
      const role = (user?.role || "").toLowerCase();
      login({ token, user, role });
      switch (role) {
        case "admin":  navigate("/admin",     { replace: true }); break;
        case "vendor": navigate("/vendor",    { replace: true }); break;
        default:       navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg">
        <img src={BG_IMAGE} alt="" aria-hidden="true" />
        <div className="auth-bg-overlay" />
      </div>

      <main className="auth-main">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 480 }}>
          <div className="auth-card">
            {/* Decorative glows */}
            <div className="auth-glow-tl" />
            <div className="auth-glow-br" />

            {/* Brand */}
            <div className="auth-brand">
              <img src={logo} alt="PureMarket" className="auth-brand-logo" />
              <p className="auth-brand-name">PureMarket</p>
              <p className="auth-brand-sub">Welcome back — sign in to continue</p>
            </div>

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="lp-email">Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Mail size={16} strokeWidth={1.8} /></span>
                  <input
                    id="lp-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="auth-input auth-input-padded"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="lp-password">Secure Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Lock size={16} strokeWidth={1.8} /></span>
                  <input
                    id="lp-password"
                    name="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="auth-input auth-input-padded"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {/* Forgot */}
              <a className="auth-forgot" href="/forgot-password">Forgot password?</a>

              {/* Submit */}
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} strokeWidth={2} className="auth-btn-arrow" />
                  </>
                )}
              </button>

              <p className="auth-muted">
                Don't have an account?{" "}
                <a className="auth-link" href="/signup">Create one</a>
              </p>
            </form>
          </div>

          <a className="auth-back" href="/">
            <ArrowLeft size={16} strokeWidth={2} />
            Back to Home
          </a>
        </div>
      </main>

      <footer className="auth-footer">
        <p>© 2026 PureMarket</p>
        <div className="auth-footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Policy</a>
        </div>
      </footer>
    </div>
  );
}