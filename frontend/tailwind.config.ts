import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "#FAF3E7", // Ivory Cream (Table 30.2 Light Mode)
          light: "#FAF3E7",
          dark: "#14201A", // Deep Pine Black-Green (Table 30.2 Dark Mode)
        },
        foreground: "#1E3D31",
        dark: {
          DEFAULT: "#14201A",
          card: "#1E2B24",
          muted: "#26332C",
        },
        primary: {
          DEFAULT: "#1E3D31", // Deep Forest Green (Table 30.2)
          hover: "#163026", // Darker Forest Green
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#6F4E37", // Roasted Brown (Table 30.2)
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#C89B5C", // Warm Gold (Table 30.2)
          foreground: "#1E3D31",
        },
        cream: {
          50: "#FFFDF9",
          100: "#FAF3E7",
          200: "#F1E9DA",
          300: "#E4D9C4",
          400: "#D6C7AE",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F1E9DA", // Beige Kertas
          dark: "#1E2B24",
        },
        success: {
          DEFAULT: "#4C7A4C",
          dark: "#6FA96F",
        },
        warning: {
          DEFAULT: "#C79A3C",
          dark: "#E0B75C",
        },
        danger: {
          DEFAULT: "#B23A34",
          dark: "#D96A63",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        heading: ["var(--font-poppins)", ...fontFamily.sans],
        poppins: ["var(--font-poppins)", ...fontFamily.sans],
        serif: ["var(--font-poppins)", "var(--font-playfair)", ...fontFamily.serif],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      scale: {
        "98": ".98",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(200, 155, 92, 0.4)",
        "glow-lg": "0 0 60px -15px rgba(200, 155, 92, 0.6)",
        "card-hover": "0 20px 40px -15px rgba(30, 61, 49, 0.08)",
        "card-shadow": "0 10px 30px -10px rgba(30, 61, 49, 0.05)",
        "postcard": "0 15px 35px -5px rgba(30, 61, 49, 0.12), 0 5px 15px -5px rgba(30, 61, 49, 0.08)",
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
