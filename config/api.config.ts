// API Configuration
// Update this with your actual API URL based on environment

// For local development:
// - Android emulator: use 10.0.2.2:3333
// - iOS simulator: use localhost:3333 or your machine's IP
// For production: use your Railway URL

export const API_CONFIG = {
  // Change this based on your environment
  //   BASE_URL: __DEV__
  //     ? "http://localhost:3333" // Local development
  //     : "https://mapin-api-production-2f0a.up.railway.app", // Production
  BASE_URL: "http://localhost:3333",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
  },
};
