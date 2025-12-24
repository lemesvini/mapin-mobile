// API Configuration
// Update this with your actual API URL based on environment

// For local development:
// - Android emulator: use 10.0.2.2:3333
// - iOS simulator: use localhost:3333 or your machine's IP
// For production: use your Railway URL

export const API_CONFIG = {
  // Change this based on your environment
  BASE_URL: "https://mapin-api-production-2f0a.up.railway.app",
  // ? "http://localhost:3333"
  // :  ? "http://localhost:3333" // Local development
  //   "https://mapin-api-production-2f0a.up.railway.app", // Production
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
  },
};

// Supabase Storage Configuration
export const STORAGE_CONFIG = {
  SUPABASE_URL: "https://jjltgqtzukfktvxaokxn.supabase.co",
  // This is the S3-compatible storage URL
  S3_URL: "https://jjltgqtzukfktvxaokxn.storage.supabase.co/storage/v1/s3",
  BUCKET: "mapin-mobile",
  // Use only the anon public key for client-side
  ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbHRncXR6dWtma3R2eGFva3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NjMxODUsImV4cCI6MjA4MjEzOTE4NX0.jQyECoVfY_eJqGG1Tp59jCjlvKIoaDkoduNr5MdBWUA",
  FOLDERS: {
    PINS: "pins",
    PROFILES: "profiles",
  },
};
