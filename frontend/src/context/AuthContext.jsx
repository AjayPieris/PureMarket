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
    const userId = localStorage.getItem("userId") || "";

    if (!token) {
      setAuth((prev) => ({ ...prev, initialized: true }));
      return;
    }

    // Immediately show user from localStorage (fast path)
    setAuth({
      isAuthenticated: true,
      token,
      role,
      user: { _id: userId, name, profileImage },
      initialized: true,
    });

    // Then silently fetch the LATEST profile (profileImage may have changed)
    // Using axios so the blocked-user interceptor applies here too
    axios.get(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        if (!data) return;
        if (data.name) localStorage.setItem("userName", data.name);
        localStorage.setItem("profileImage", data.profileImage || "");
        localStorage.setItem("role", (data.role || "").toLowerCase());
        if (data.id) localStorage.setItem("userId", data.id);

        setAuth((prev) => ({
          ...prev,
          role: (data.role || "").toLowerCase(),
          user: {
            ...prev.user,
            _id: data.id || prev.user?._id || "",
            name: data.name || prev.user?.name || "",
            profileImage: data.profileImage || "",
            email: data.email || "",
          },
        }));
      })
      .catch(() => {
        // Network error or 403 blocked → interceptor handles blocked case
      });
  }, []);

  // Global interceptor: if any API call returns 403 blocked, force logout immediately
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 403 && err.response?.data?.blocked) {
          // Skip redirect for the login endpoint — let login.jsx show the toast itself
          const url = err.config?.url || "";
          if (!url.includes("/auth/login")) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userName");
            localStorage.removeItem("profileImage");
            setAuth({ isAuthenticated: false, token: "", role: "", user: null, initialized: true });
            window.location.href = "/login?blocked=1";
          }
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  // Periodically re-check auth status so blocked users are detected quickly
  useEffect(() => {
    function checkAuth() {
      const token = localStorage.getItem("token");
      if (!token) return;
      // Interceptor handles 403 blocked response automatically
      axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    // Re-check when user brings tab back into focus
    document.addEventListener("visibilitychange", checkAuth);
    // Also poll every 45 seconds for mid-session block detection
    const interval = setInterval(checkAuth, 45000);

    return () => {
      document.removeEventListener("visibilitychange", checkAuth);
      clearInterval(interval);
    };
  }, []);

  function login({ token, user, role }) {
    const finalRole = (role || user?.role || "").toLowerCase();
    localStorage.setItem("token", token);
    if (finalRole) localStorage.setItem("role", finalRole);
    if (user?.name) localStorage.setItem("userName", user.name);
    localStorage.setItem("profileImage", user?.profileImage || "");
    // Store the user ID so isOwner checks work correctly
    if (user?.id || user?._id) localStorage.setItem("userId", user.id || user._id);
    setAuth({
      isAuthenticated: true,
      token,
      role: finalRole,
      user: user ? { ...user, _id: user.id || user._id } : null,
      initialized: true,
    });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("userId");
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