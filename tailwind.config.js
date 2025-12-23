/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Light mode colors
        light: {
          text: "#11181C",
          background: "#fff",
          tint: "#0a7ea4",
          icon: "#687076",
          tabIconDefault: "#687076",
          tabIconSelected: "#0a7ea4",
        },
        // Dark mode colors
        dark: {
          text: "#ECEDEE",
          background: "#151718",
          tint: "#fff",
          icon: "#9BA1A6",
          tabIconDefault: "#9BA1A6",
          tabIconSelected: "#fff",
        },
      },
    },
  },
  plugins: [],
};
