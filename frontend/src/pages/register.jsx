import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { uploadFiles } from "../utils/uploadthing";
import "../page_style/register.css";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Customer",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const res = await uploadFiles("imageUploader", { files: [file] });
      const url = res?.[0]?.url || res?.[0]?.ufsUrl || "";
      setProfileImageUrl(url);
    } catch (err) {
      toast.error("Image upload failed: " + (err.message || "Unknown error"));
      setPreviewUrl("");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        role: String(form.role).toLowerCase(),
        profileImage: profileImageUrl,
      };

      const { data } = await axios.post(`${API_BASE}/api/auth/register`, payload);
      toast.success(data.message || "Registered successfully!");
      const successMessage = data.message || "Registration successful! Please sign in.";
      navigate("/signin", {
        state: {
          fromRegister: true,
          message: successMessage,
        },
        replace: true,
      });
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Registration failed";
      toast.error(message);
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

        {/* ── Avatar Upload ── */}
        <div className="reg-avatar-section">
          <button
            type="button"
            className="reg-avatar-wrap"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload profile photo"
            disabled={uploading}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Profile preview" className="reg-avatar-img" />
            ) : (
              <span className="reg-avatar-placeholder" aria-hidden>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="#a78bfa" strokeWidth="1.4" />
                  <path d="M4 20.5c0-3.59 3.582-6.5 8-6.5s8 2.91 8 6.5" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
            )}
            {uploading ? (
              <span className="reg-avatar-overlay uploading" aria-label="Uploading…">
                <span className="reg-spinner" />
              </span>
            ) : (
              <span className="reg-avatar-overlay" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V8m0 0-3 3m3-3 3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 20h14" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            )}
          </button>
          <p className="reg-avatar-hint">
            {uploading
              ? "Uploading…"
              : profileImageUrl
              ? "✓ Photo uploaded"
              : "Click to add photo"}
          </p>
          <input
            ref={fileInputRef}
            id="reg-avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
            aria-hidden="true"
          />
        </div>

        {/* ── Name ── */}
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

        {/* ── Email ── */}
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

        {/* ── Role ── */}
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

        {/* ── Password ── */}
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

        <button type="submit" className="reg-btn" disabled={loading || uploading}>
          {loading ? "Creating…" : "Create Account"}
        </button>



        <p className="reg-muted">
          Already have an account? <a className="reg-link" href="/signin">Sign in</a>
        </p>
      </form>
    </main>
  );
}