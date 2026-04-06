import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../page_style/auth.css";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const BG_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDydt4uI7y7lr1W8idxf8IGYG6BEb0PCSUHWMwUqvXSF3bIVXzmwHeC3utzXQS4ksKJZVSTKELKBdV1icHxUTEfyjU4pxMrygMZEPzZmK7lnTD_aNEJ2i0ftCdYMHR_WFKsA7P_6z5M5W0y7QkP3SfTGUvxEIf9j1TYHq7X6TeSOBAONlF8kiuIy7pJNyt4CGQs45pI5CnBh8rTyALMidlS8SuwEEnWW_JQx2S3HMpFJ9IDN0J34_OkZ8Wb0iFxW7Y8pdSTHAerEbI";

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
    <div className="auth-page">
      <div className="auth-bg">
        <img src={BG_IMAGE} alt="" aria-hidden="true" />
        <div className="auth-bg-overlay" />
      </div>

      <main className="auth-main">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 480 }}>
          <div className="auth-card">
            <div className="auth-glow-tl" />
            <div className="auth-glow-br" />

            <div className="auth-brand">
              <img src={logo} alt="PureMarket" className="auth-brand-logo" />
              <p className="auth-brand-name">PureMarket</p>
              <p className="auth-brand-sub">Forgot Password?</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="fp-email">Email Address</label>
                <input
                  id="fp-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  autoComplete="email"
                  required
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <span className="material-symbols-outlined auth-btn-arrow">arrow_forward</span>
                  </>
                )}
              </button>

              <p className="auth-muted">
                Remember your password?{" "}
                <Link className="auth-link" to="/signin">Sign in</Link>
              </p>
            </form>
          </div>

          <a className="auth-back" href="/">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back to Home
          </a>
        </div>
      </main>

      <footer className="auth-footer">
        <p>© 2024 PureMarket — The Ethereal Boutique</p>
      </footer>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
    </div>
  );
}
