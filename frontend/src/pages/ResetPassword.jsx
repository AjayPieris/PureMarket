import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../page_style/login.css";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/auth/reset-password/${token}`,
        { password: form.password }
      );
      toast.success(data.message || "Password reset!");
      setTimeout(() => navigate("/signin", { replace: true }), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="log-page" role="main">
      <header className="log-header">
        <div className="log-logo" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l7 4v8l-7 4-7-4V6l7-4z" stroke="white" strokeWidth="1.5" />
            <path d="M12 2v8l7 4M12 10L5 14" stroke="white" strokeWidth="1.1" opacity=".7" />
          </svg>
        </div>
        <h1 className="log-title">New Password</h1>
        <p className="log-subtitle">Choose a strong password for your account</p>
      </header>

      <form className="log-card" onSubmit={handleSubmit} noValidate>

        {/* New password */}
        <label className="log-label center" htmlFor="rp-password">New password</label>
        <div className="log-field">
          <span className="log-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="10" width="16" height="10" rx="2" stroke="#9AA3AF" strokeWidth="1.5" />
              <path d="M8 10V8a4 4 0 118 0v2" stroke="#9AA3AF" strokeWidth="1.5" />
            </svg>
          </span>
          <input
            id="rp-password"
            name="password"
            type={showPw ? "text" : "password"}
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            className="log-input"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{
              position: "absolute", right: "12px", top: "50%",
              transform: "translateY(-50%)", background: "none",
              border: "none", cursor: "pointer", color: "#9aa3af",
              padding: 0, fontSize: "12px", lineHeight: 1,
            }}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm password */}
        <label className="log-label center" htmlFor="rp-confirm">Confirm password</label>
        <div className="log-field">
          <span className="log-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="10" width="16" height="10" rx="2" stroke="#9AA3AF" strokeWidth="1.5" />
              <path d="M8 10V8a4 4 0 118 0v2" stroke="#9AA3AF" strokeWidth="1.5" />
            </svg>
          </span>
          <input
            id="rp-confirm"
            name="confirm"
            type={showPw ? "text" : "password"}
            placeholder="Repeat password"
            value={form.confirm}
            onChange={handleChange}
            className="log-input"
            autoComplete="new-password"
            required
          />
        </div>



        <button type="submit" className="log-btn" disabled={loading}>
          {loading ? "Saving…" : "Reset Password"}
        </button>

        <p className="log-muted">
          <Link className="log-link" to="/signin">Back to Sign In</Link>
        </p>
      </form>

      <a className="home-back" href="/">
        <span className="home-arrow" aria-hidden="true">←</span> Back to Home
      </a>
    </main>
  );
}
