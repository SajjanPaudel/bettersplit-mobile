/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          100:"#8000800A",
          200:"#8000801A",
          300:"#8000802A"
        },
        accent:{
          100:"#FBFBFD",
        },
        black:{
          DEFAULT: "#0000000",
          100:"#8C8E98",
          200:"#666876",
          300:"#191d31"
        },
        secondary: "#6c757d",
        success: "#28a745",
        danger: "#F75555",
        warning: "#ffc107",
        info: "#17a2b8",
        light: "#f8f9fa",
        dark: "#343a40",
      },
    },
  },
  plugins: [],
}