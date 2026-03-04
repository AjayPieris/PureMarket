import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../page_style/login.css";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      toast.success(data.message || "Reset link sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong.");
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
        <h1 className="log-title">Forgot Password?</h1>
        <p className="log-subtitle">Enter your email and we'll send a reset link</p>
      </header>

      <form className="log-card" onSubmit={handleSubmit} noValidate>
        <label className="log-label center" htmlFor="fp-email">Email address</label>
        <div className="log-field">
          <span className="log-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6.75A1.75 1.75 0 014.75 5h14.5A1.75 1.75 0 0121 6.75v10.5A1.75 1.75 0 0119.25 19H4.75A1.75 1.75 0 013 17.25V6.75z" stroke="#9AA3AF" strokeWidth="1.5" />
              <path d="M4 7l8 5 8-5" stroke="#9AA3AF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="fp-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="log-input"
            autoComplete="email"
            required
          />
        </div>



        <button type="submit" className="log-btn" disabled={loading}>
          {loading ? "Sending…" : "Send Reset Link"}
        </button>

        <p className="log-muted">
          Remember your password?{" "}
          <Link className="log-link" to="/signin">Sign in</Link>
        </p>
      </form>

      <a className="home-back" href="/">
        <span className="home-arrow" aria-hidden="true">←</span> Back to Home
      </a>
    </main>
  );
}
