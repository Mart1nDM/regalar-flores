import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          yellow: "#FFF3B0",
          cream: "#FFF9E6",
          green: "#D8E9C9",
          rose: "#FFE3E0",
          sky: "#E5F0FF",
          sand: "#F6E3C5",
        },
        sunflower: {
          100: "#FFF7CC",
          200: "#FFED8A",
          300: "#FFD94D",
          400: "#FFC81A",
          500: "#F7B500",
          600: "#D99B00",
          700: "#B07F00",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        "float-slow": "float 7s ease-in-out infinite",
        "float-slower": "float 10s ease-in-out infinite",
        sway: "sway 5s ease-in-out infinite",
        "blink-soft": "blink 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      boxShadow: {
        polaroid: "0 12px 40px -8px rgba(180, 140, 0, 0.35)",
        soft: "0 10px 30px -12px rgba(120, 100, 40, 0.25)",
      },
      borderRadius: {
        wave: "18px 18px 60px 60px",
      },
    },
  },
  plugins: [],
};

export default config;