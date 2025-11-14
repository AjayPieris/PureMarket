import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../page_style/register.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Customer",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      // Map "Customer" -> "customer", "Vendor" -> "vendor"
      const payload = {
        ...form,
        role: String(form.role).toLowerCase(),
      };

      const { data } = await axios.post(`${API_BASE}/api/auth/register`, payload);
      setMsg(data.message || "Registered successfully");
      const successMessage = data.message || "Registration successful! Please sign in.";
       navigate("/signin", {
        state: {
          fromRegister: true,
          message: successMessage,
        },
        replace: true, // optional: replace history so back doesn’t re-show register
      });


    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Registration failed";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="reg-page" role="main">
      <header className="reg-header">
        <div className="reg-logo" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l7 4v8l-7 4-7-4V6l7-4z" stroke="white" strokeWidth="1.5" />
            <path d="M12 2v8l7 4M12 10L5 14" stroke="white" strokeWidth="1.1" opacity=".7" />
          </svg>
        </div>
        <h1 className="reg-title">Create Account</h1>
        <p className="reg-subtitle">Join MarketPlace today</p>
      </header>

      <form className="reg-card" onSubmit={handleSubmit}>
        <label className="reg-label center" htmlFor="name">Full Name</label>
        <div className="reg-field">
          <span className="reg-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="#9AA3AF" strokeWidth="1.5" />
              <path d="M4 20.5c0-3.59 3.582-6.5 8-6.5s8 2.91 8 6.5" stroke="#9AA3AF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            className="reg-input"
            autoComplete="name"
            required
          />
        </div>

        <label className="reg-label center" htmlFor="email">Email</label>
        <div className="reg-field">
          <span className="reg-icon" aria-hidden>
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
            className="reg-input"
            autoComplete="email"
            required
          />
        </div>

        <label className="reg-label center" htmlFor="role">Register as</label>
        <div className="reg-field">
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="reg-select"
            aria-label="Register as"
          >
            <option>Customer</option>
            <option>Vendor</option>
          </select>
          <span className="reg-caret" aria-hidden>▾</span>
        </div>

        <label className="reg-label center" htmlFor="password">Password</label>
        <div className="reg-field">
          <span className="reg-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="10" width="16" height="10" rx="2" stroke="#9AA3AF" strokeWidth="1.5" />
              <path d="M8 10V8a4 4 0 118 0v2" stroke="#9AA3AF" strokeWidth="1.5" />
            </svg>
          </span>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            className="reg-input"
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="reg-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        {msg && <p className="reg-message" role="alert">{msg}</p>}

        <p className="reg-muted">
          Already have an account? <a className="reg-link" href="/signin">Sign in</a>
        </p>
      </form>
    </main>
  );
}