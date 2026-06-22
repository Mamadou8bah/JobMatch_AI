/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: "#98ec6f",
          "lime-deep": "#6fc950",
          ink: "#18181b",
          muted: "#71717a",
          wash: "#f4f4f5",
          dark: "#071008",
        },
        "brand-lime": "#98ec6f",
        "brand-dark": "#071008",
      },
      fontFamily: {
        sans: [
          "Google Sans Flex",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        dash: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
        phone: "0 36px 64px rgba(0, 0, 0, 0.48)",
      },
      borderRadius: {
        dash: "16px",
        "dash-sm": "10px",
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(151,236,111,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(151,236,111,0.06) 1px, transparent 1px), radial-gradient(circle at 70% 42%, rgba(85,203,38,0.3), transparent 32%), linear-gradient(135deg, #071008 0%, #0c170b 52%, #061105 100%)",
      },
      backgroundSize: {
        hero: "260px 260px, 260px 260px, auto, auto",
      },
    },
  },
  plugins: [],
};
