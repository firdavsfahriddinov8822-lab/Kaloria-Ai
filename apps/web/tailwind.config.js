/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Structural
        bg: "#080B1A",
        elev: "#131A2E",
        elev2: "#1C2440",
        elev3: "#242D50",
        line: "#2A3459",
        ink: "#EAF0FF",
        dim: "#8A96B8",
        mute: "#5A6788",

        // Brand
        cal: "#FFB020",
        burn: "#FF5A3C",
        body: "#2DD4BF",

        // Macro accents
        protein: "#2DD4BF",
        fat: "#F59E0B",
        carbs: "#F97316",
        sugar: "#EC4899",
        salt: "#A78BFA",
        water: "#38BDF8",

        // Semantic
        success: "#22C55E",
        warn: "#F59E0B",
        danger: "#EF4444",
        info: "#38BDF8",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-cal": "0 0 48px -8px rgba(255, 176, 32, 0.45)",
        "glow-burn": "0 0 48px -8px rgba(255, 90, 60, 0.4)",
        "glow-body": "0 0 48px -8px rgba(45, 212, 191, 0.4)",
        "glow-info": "0 0 40px -8px rgba(56, 189, 248, 0.35)",
        card: "0 8px 24px -12px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 220ms ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
      backgroundImage: {
        "cal-gradient": "linear-gradient(135deg, #FFB020 0%, #FF5A3C 100%)",
        "burn-gradient": "linear-gradient(135deg, #FF5A3C 0%, #EC4899 100%)",
        "body-gradient": "linear-gradient(135deg, #2DD4BF 0%, #38BDF8 100%)",
        "hero-glow":
          "radial-gradient(circle at 50% 30%, rgba(255,176,32,0.20), transparent 60%)",
      },
    },
  },
  plugins: [],
};
