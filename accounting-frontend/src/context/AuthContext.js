// context/AuthContext.js
"use client";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accounting_token");
  });
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("accounting_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const setAuth = (userData, tok) => {
    localStorage.setItem("accounting_token", tok);
    localStorage.setItem("accounting_user", JSON.stringify(userData));
    setToken(tok);
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem("accounting_token");
    localStorage.removeItem("accounting_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem("accounting_user", JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, setAuth, clearAuth, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
