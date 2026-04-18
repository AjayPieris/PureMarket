import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { uploadFiles } from "../utils/uploadthing";
import "../page_style/auth.css";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";
import {
  ArrowRight,
  UserRound,
  Mail,
  Lock,
  ChevronDown,
  Camera,
  Plus,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const BG_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDydt4uI7y7lr1W8idxf8IGYG6BEb0PCSUHWMwUqvXSF3bIVXzmwHeC3utzXQS4ksKJZVSTKELKBdV1icHxUTEfyjU4pxMrygMZEPzZmK7lnTD_aNEJ2i0ftCdYMHR_WFKsA7P_6z5M5W0y7QkP3SfTGUvxEIf9j1TYHq7X6TeSOBAONlF8kiuIy7pJNyt4CGQs45pI5CnBh8rTyALMidlS8SuwEEnWW_JQx2S3HMpFJ9IDN0J34_OkZ8Wb0iFxW7Y8pdSTHAerEbI";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", role: "Customer", password: "" });
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
      navigate("/signin", {
        state: { fromRegister: true, message: data.message || "Registration successful!" },
        replace: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Registration failed");
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
              <p className="auth-brand-sub">Join the curated collective</p>
            </div>

            {/* Avatar Upload */}
            <div className="auth-avatar-section">
              <button
                type="button"
                className="auth-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile photo"
                disabled={uploading}
              >
                <div className="auth-avatar-ring">
                  <div className="auth-avatar-inner">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile preview" />
                    ) : uploading ? (
                      <span className="auth-spinner" />
                    ) : (
                      <Camera size={32} strokeWidth={1.4} style={{ color: "rgba(211,187,255,0.45)" }} />
                    )}
                  </div>
                </div>
                <div className="auth-avatar-badge">
                  <Plus size={14} strokeWidth={2.5} />
                </div>
              </button>
              <p className="auth-avatar-hint">
                {uploading ? "Uploading…" : profileImageUrl ? "✓ Photo uploaded" : "Upload Profile Picture"}
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

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>

              {/* Full Name */}
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="reg-name">Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><UserRound size={16} strokeWidth={1.8} /></span>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    placeholder="Your Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="auth-input auth-input-padded"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="reg-email">Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Mail size={16} strokeWidth={1.8} /></span>
                  <input
                    id="reg-email"
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

              {/* Role */}
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="reg-role">Register As</label>
                <div className="auth-select-wrap">
                  <select
                    id="reg-role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="auth-select"
                    aria-label="Register as"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                  <div className="auth-select-caret">
                    <ChevronDown size={18} strokeWidth={2} />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="reg-password">Secure Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Lock size={16} strokeWidth={1.8} /></span>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="auth-input auth-input-padded"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="auth-btn" disabled={loading || uploading}>
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>
                    <span>Create Exclusive Account</span>
                    <ArrowRight size={20} strokeWidth={2} className="auth-btn-arrow" />
                  </>
                )}
              </button>

              <p className="auth-muted">
                Already a member?{" "}
                <a className="auth-link" href="/signin">Sign In</a>
              </p>
            </form>
          </div>
        </div>
      </main>

      <footer className="auth-footer">
        <p>© 2026 PureMarket</p>
        <div className="auth-footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Boutique Policy</a>
        </div>
      </footer>
    </div>
  );
}