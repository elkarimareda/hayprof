import React, { useState, useEffect, useCallback } from "react";
import type { User } from "./Models/Auth";
import { AuthContext } from "./hooks/useAuth";
import api from "./utils/request";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getUser = useCallback(async () => {
    try {
      const response = await api.get("/user");
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to get user:", error);
      localStorage.removeItem("auth-token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any state

  // Restore auth state on app load
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      getUser();
    } else {
      setIsLoading(false);
    }
  }, [getUser]); // Add getUser to dependency array

  const login = async (identifier: string, password: string) => {
    try {
      const response = await api.post("/login", {
        identifier,
        password,
      });

      if (response.data) {
        const userData = response.data;
        setUser(userData.user);
        setIsAuthenticated(true);
        localStorage.setItem("auth-token", userData.token);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("auth-token");
      setUser(null);
      setIsAuthenticated(false);
      window.location.reload();
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
