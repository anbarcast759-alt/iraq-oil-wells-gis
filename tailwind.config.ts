import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Remapped to CSS variables (see globals.css :root / .light) so
        // every existing `text-white`, `bg-white/5`, `border-white/10`,
        // and `bg-brand-navy` usage across the app automatically
        // flips for the light theme — without editing every component.
        // The `<alpha-value>` placeholder is required by Tailwind for
        // opacity modifiers (e.g. `text-white/60`) to work with a
        // CSS-variable-based color.
        white: "rgb(var(--fg-rgb) / <alpha-value>)",
        brand: {
          navy: "rgb(var(--navy-rgb) / <alpha-value>)",
          "navy-light": "rgb(var(--navy-light-rgb) / <alpha-value>)",
          gold: "#C9A24B",
          "gold-light": "#E4C878",
          rust: "#B5533C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "Tahoma", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
