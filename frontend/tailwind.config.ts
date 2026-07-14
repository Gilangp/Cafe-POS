import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "#FAF6F0", // Warm cream light aesthetic for main sections
        foreground: "#1E1A17",
        dark: {
          DEFAULT: "#12100E",
          card: "#1A1715",
          muted: "#26221E",
        },
        primary: {
          DEFAULT: "#C9A36C",
          hover: "#B89158",
          foreground: "#12100E",
        },
        cream: {
          50: "#FFFDF9",
          100: "#FAF6F0",
          200: "#F5ECE0",
          300: "#EADCC8",
          400: "#DECBB1",
        },
        accent: {
          DEFAULT: "#D4956A",
          foreground: "#12100E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        serif: ["var(--font-playfair)", ...fontFamily.serif],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(201, 163, 108, 0.4)",
        "glow-lg": "0 0 60px -15px rgba(201, 163, 108, 0.6)",
        "card-hover": "0 20px 40px -15px rgba(30, 26, 23, 0.08)",
        "card-shadow": "0 10px 30px -10px rgba(30, 26, 23, 0.05)",
        "postcard": "0 15px 35px -5px rgba(30, 26, 23, 0.12), 0 5px 15px -5px rgba(30, 26, 23, 0.08)",
      },
      animation: {
        "spin-slow": "spin 25s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
