/** @type {import('tailwindcss').Config} */
// ValEstate mobile — mirrors web/app/globals.css tokens 1:1 so the same class
// names (bg-surface, text-brand, border-line, bg-brand-soft, …) behave the same
// on native. Values live as CSS variables in global.css; light/dark switch there.
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        fg: "hsl(var(--fg) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        subtle: "hsl(var(--subtle) / <alpha-value>)",
        line: "hsl(var(--line) / <alpha-value>)",
        field: "hsl(var(--field) / <alpha-value>)",
        brand: {
          DEFAULT: "hsl(var(--brand) / <alpha-value>)",
          2: "hsl(var(--brand-2) / <alpha-value>)",
          soft: "hsl(var(--brand-soft) / <alpha-value>)",
        },
        accent: "hsl(var(--accent) / <alpha-value>)",
        success: "hsl(var(--success) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "22px",
        "3xl": "28px",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
