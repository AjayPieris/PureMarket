import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";


const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: "",
    role: "",
    user: null,
    initialized: false,
  });

  // On mount: restore token from localStorage, then fetch fresh profile from /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const role = (localStorage.getItem("role") || "").toLowerCase();
    const name = localStorage.getItem("userName") || "";
    const profileImage = localStorage.getItem("profileImage") || "";

    if (!token) {
      setAuth((prev) => ({ ...prev, initialized: true }));
      return;
    }

    // Immediately show user from localStorage (fast path)
    setAuth({
      isAuthenticated: true,
      token,
      role,
      user: { name, profileImage },
      initialized: true,
    });

    // Then silently fetch the LATEST profile (profileImage may have changed)
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        // Persist fresh data to localStorage
        if (data.name) localStorage.setItem("userName", data.name);
        localStorage.setItem("profileImage", data.profileImage || "");
        localStorage.setItem("role", (data.role || "").toLowerCase());

        setAuth((prev) => ({
          ...prev,
          role: (data.role || "").toLowerCase(),
          user: {
            ...prev.user,
            name: data.name || prev.user?.name || "",
            profileImage: data.profileImage || "",
            email: data.email || "",
          },
        }));
      })
      .catch(() => {
        // Network error — keep localStorage values
      });
  }, []);

  // Global interceptor: if any API call returns 403 blocked, force logout immediately
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 403 && err.response?.data?.blocked) {
          // Clear everything
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userName");
          localStorage.removeItem("profileImage");
          setAuth({ isAuthenticated: false, token: "", role: "", user: null, initialized: true });
          // Redirect to login with a flag so the login page can show a toast
          window.location.href = "/login?blocked=1";
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  function login({ token, user, role }) {
    const finalRole = (role || user?.role || "").toLowerCase();
    localStorage.setItem("token", token);
    if (finalRole) localStorage.setItem("role", finalRole);
    if (user?.name) localStorage.setItem("userName", user.name);
    localStorage.setItem("profileImage", user?.profileImage || "");
    setAuth({
      isAuthenticated: true,
      token,
      role: finalRole,
      user: user || null,
      initialized: true,
    });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("profileImage");
    setAuth({
      isAuthenticated: false,
      token: "",
      role: "",
      user: null,
      initialized: true,
    });
  }

  const value = useMemo(() => ({ ...auth, login, logout }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}