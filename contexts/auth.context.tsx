import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { authService } from "@/services/auth.service";
import {
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and user on mount
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

        if (!storedToken) return;

        setToken(storedToken);

        const userData = await authService.getCurrentUser(storedToken);
        setUser(userData);
      } catch (error) {
        console.error("Error loading stored auth:", error);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Update axios auth token whenever token changes
  useEffect(() => {
    authService.setAuthToken(token);
  }, [token]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      await SecureStore.setItemAsync(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authService.register(credentials);
      await SecureStore.setItemAsync(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const userData = await authService.getCurrentUser(token);
      setUser(userData);
    } catch (error) {
      console.error("Refresh user error:", error);
      // If refresh fails, logout
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
