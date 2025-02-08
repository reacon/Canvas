import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthService } from "../services/AuthService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ name: "Guest" });

  const fetchsession = async () => {
    try {
      const response = await AuthService.checksession();
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
  };

  useEffect(() => {
    fetchsession();
  }, []);

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser({ name: "Guest" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
