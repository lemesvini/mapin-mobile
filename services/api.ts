import axios from "axios";

// TODO: Update this with your actual API URL
// For local development on Android emulator, use 10.0.2.2
// For iOS simulator, use localhost or your machine's IP
const API_URL = "http://localhost:3333/auth";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    // Token will be added by the auth context when needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || "An error occurred";
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error("No response from server. Please check your connection.");
    } else {
      // Error setting up request
      throw new Error(error.message || "An error occurred");
    }
  }
);

export default api;
