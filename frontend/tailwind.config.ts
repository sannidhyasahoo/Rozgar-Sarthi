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
        dark: {
          bg: "#08070c",
          surface: "#0e0d14",
          card: "#12111a",
          cardHover: "#181622",
          border: "#1f1c2b",
          borderLight: "#2e2840",
          muted: "#9e98b7",
        },
        iris: "#6a5ed9",
        cobalt: "#3f71d4",
        coral: "#db5434",
        sprout: "#1bb152",
        emerald: "#16a34a",
        mint: "#22c55e",
        lime: "#4ade80",
        crimson: "#ef4444",
        saffron: "#ffb929",
        "mint-wash": "#dcfce7",
        "saffron-wash": "#fdc75c",
        zinc: {
          50: "var(--color-zinc-50, #fafafa)",
          100: "var(--color-zinc-100, #f4f4f5)",
          200: "var(--color-zinc-200, #e4e4e7)",
          300: "var(--color-zinc-300, #d4d4d8)",
          400: "var(--color-zinc-400, #a1a1aa)",
          500: "var(--color-zinc-500, #71717a)",
          600: "var(--color-zinc-600, #52525b)",
          700: "var(--color-zinc-700, #3f3f46)",
          800: "var(--color-zinc-800, #27272a)",
          900: "var(--color-zinc-900, #18181b)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "'DM Mono'", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        subtle: "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px",
        "subtle-2": "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
        xl: "rgba(0, 0, 0, 0.25) 0px 25px 50px -12px",
        "dark-elevated": "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
      },
      maxWidth: {
        page: "1200px",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
