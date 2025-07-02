import React, { createContext, useState, useEffect, useContext } from "react";
import { getToken, getCurrentUser, clearToken, logout as apiLogout } from "./api";

// PUBLIC_INTERFACE
const AuthContext = createContext();

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check JWT/user at app load
  useEffect(() => {
    const tryRestore = async () => {
      if (getToken()) {
        try {
          const profile = await getCurrentUser();
          setUser(profile);
        } catch {
          setUser(null);
          clearToken();
        }
      }
      setAuthLoading(false);
    };
    tryRestore();
  }, []);

  // PUBLIC_INTERFACE
  const login = (userObj) => {
    setUser(userObj);
  };
  // PUBLIC_INTERFACE
  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}
