import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../page_style/auth.css";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const BG_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDydt4uI7y7lr1W8idxf8IGYG6BEb0PCSUHWMwUqvXSF3bIVXzmwHeC3utzXQS4ksKJZVSTKELKBdV1icHxUTEfyjU4pxMrygMZEPzZmK7lnTD_aNEJ2i0ftCdYMHR_WFKsA7P_6z5M5W0y7QkP3SfTGUvxEIf9j1TYHq7X6TeSOBAONlF8kiuIy7pJNyt4CGQs45pI5CnBh8rTyALMidlS8SuwEEnWW_JQx2S3HMpFJ9IDN0J34_OkZ8Wb0iFxW7Y8pdSTHAerEbI";

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
    if (form.password !== form.confirm) { toast.error("Passwords do not match."); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/reset-password/${token}`, { password: form.password });
      toast.success(data.message || "Password reset!");
      setTimeout(() => navigate("/signin", { replace: true }), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Reset failed.");
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
              <p className="auth-brand-sub">Choose a strong new password</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="rp-password">New Password</label>
                <input
                  id="rp-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className="auth-input"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-label" htmlFor="rp-confirm">Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="rp-confirm"
                    name="confirm"
                    type={showPw ? "text" : "password"}
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={handleChange}
                    className="auth-input"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      position: "absolute", right: 14, top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", cursor: "pointer",
                      color: "rgba(204,195,215,0.6)", fontSize: 12, fontWeight: 600,
                      fontFamily: "Manrope, sans-serif", padding: 0,
                    }}
                    aria-label={showPw ? "Hide" : "Show"}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>
                    <span>Reset Password</span>
                    <span className="material-symbols-outlined auth-btn-arrow">arrow_forward</span>
                  </>
                )}
              </button>

              <p className="auth-muted">
                <Link className="auth-link" to="/signin">Back to Sign In</Link>
              </p>
            </form>
          </div>

          <a className="auth-back" href="/">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back to Home
          </a>
        </div>
      </main>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
    </div>
  );
}
