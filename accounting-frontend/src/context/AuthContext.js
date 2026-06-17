"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("accounting_token");
    const storedUser = localStorage.getItem("accounting_user");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const setAuth = (userData, tokenValue) => {
    localStorage.setItem("accounting_token", tokenValue);
    localStorage.setItem("accounting_user", JSON.stringify(userData));

    setToken(tokenValue);
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem("accounting_token");
    localStorage.removeItem("accounting_user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setAuth,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);