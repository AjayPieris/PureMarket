/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        skeuo: "6px 6px 12px #c5c5c5, -6px -6px 12px #ffffff",
        "skeuo-inner":
          "inset 6px 6px 12px #c5c5c5, inset -6px -6px 12px #ffffff",
        "skeuo-sm": "3px 3px 6px #c5c5c5, -3px -3px 6px #ffffff",
        "skeuo-inner-sm":
          "inset 3px 3px 6px #c5c5c5, inset -3px -3px 6px #ffffff",
      },
      colors: {
        "skeuo-bg": "#e0e5ec",
      },
    },
  },
  plugins: [],
};
