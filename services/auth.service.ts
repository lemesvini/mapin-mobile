import api from "./api";
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types/auth";

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/login", credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/register", credentials);
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await api.get<{ user: User }>("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user;
  },

  /**
   * Set auth token for all requests
   */
  setAuthToken(token: string | null) {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  },
};
