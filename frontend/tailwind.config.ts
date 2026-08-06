import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Menggunakan nama token dari 06_design_system.md
        border: "hsl(var(--border))", // #E4D9C4
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))", // #C89B5C
        background: "hsl(var(--background))", // #F8F6F2
        foreground: "hsl(var(--foreground))", // #1A2620

        primary: {
          DEFAULT: "hsl(var(--primary))", // #1E3D31
          foreground: "hsl(var(--primary-foreground))", // #F8F6F2
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Tetap #1E3D31
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // #C89B5C
          foreground: "hsl(var(--accent-foreground))", // #1E3D31
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // #ef4444
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))", // #22c55e
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        
        // Warna spesifik TailAdmin yang mungkin masih berguna
        stroke: "hsl(var(--border))",
        boxdark: "#24303F",
        "boxdark-2": "#1A222C",
        "form-input": "#1d2a39",
      },
      fontFamily: {
        // Menggunakan font dari 06_design_system.md
        body: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-outfit)", "sans-serif"],
      },
      borderRadius: {
        // Menggunakan standar TailAdmin dari 06_design_system.md
        sm: "0.125rem", // 2px
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",   // 8px
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        // Menggunakan standar TailAdmin dari 06_design_system.md
        default: "0px 1px 4px 0px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
