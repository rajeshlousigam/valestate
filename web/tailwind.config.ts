import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // placeholder brand tokens (design system: docs/16 §9)
        trust: "#0f766e",
      },
    },
  },
  plugins: [],
};

export default config;
