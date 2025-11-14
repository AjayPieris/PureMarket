import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: "",
    role: "",
    user: null,
    initialized: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (token) {
      setAuth({
        isAuthenticated: true,
        token,
        role,
        user: null,
        initialized: true,
      });
    } else {
      setAuth((prev) => ({ ...prev, initialized: true }));
    }
  }, []);

  function login({ token, user, role }) {
    const finalRole = (role || user?.role || "").toLowerCase();
    localStorage.setItem("token", token);
    if (finalRole) localStorage.setItem("role", finalRole);
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