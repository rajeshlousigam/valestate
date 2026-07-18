import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // token-driven (CSS vars in globals.css) so light/dark just swap variables
        bg: "hsl(var(--bg) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        fg: "hsl(var(--fg) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        subtle: "hsl(var(--subtle) / <alpha-value>)",
        line: "hsl(var(--line) / <alpha-value>)",
        brand: {
          DEFAULT: "hsl(var(--brand) / <alpha-value>)",
          soft: "hsl(var(--brand-soft) / <alpha-value>)",
        },
        accent: "hsl(var(--accent) / <alpha-value>)",
        aurora1: "hsl(var(--aurora-1) / <alpha-value>)",
        aurora2: "hsl(var(--aurora-2) / <alpha-value>)",
        aurora3: "hsl(var(--aurora-3) / <alpha-value>)",
        success: "hsl(var(--success) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glass: "0 8px 32px -8px rgb(0 0 0 / 0.18), inset 0 1px 0 0 rgb(255 255 255 / 0.25)",
        "glass-lg": "0 24px 64px -16px rgb(0 0 0 / 0.28), inset 0 1px 0 0 rgb(255 255 255 / 0.3)",
        glow: "0 0 0 1px hsl(var(--brand) / 0.3), 0 8px 40px -8px hsl(var(--brand) / 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        sans: [
          "SF Pro Display",
          "SF Pro Text",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        "aurora-move": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(6%, -8%) scale(1.15)" },
          "66%": { transform: "translate(-6%, 6%) scale(0.9)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "aurora-1": "aurora-move 22s ease-in-out infinite",
        "aurora-2": "aurora-move 28s ease-in-out infinite reverse",
        "aurora-3": "aurora-move 34s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
