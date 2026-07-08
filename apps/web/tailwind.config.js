/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1020",
        elev: "#141B2E",
        elev2: "#1C2440",
        ink: "#EAF0FF",
        dim: "#8A96B8",
        cal: "#FFB020",
        burn: "#FF5A3C",
        body: "#2DD4BF",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
