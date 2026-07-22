import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        panel: "var(--panel)",
        panel2: "var(--panel2)",
        panel3: "var(--panel3)",
        line: "var(--line)",
        line2: "var(--line2)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        accent2: "var(--accent2)",
        danger: "var(--danger)",
        muted: "var(--muted)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "glow-accent": "0 0 0 1px rgba(62,214,166,0.25), 0 0 16px rgba(62,214,166,0.10)",
        "glow-danger": "0 0 0 1px rgba(240,101,79,0.25), 0 0 16px rgba(240,101,79,0.10)",
        card: "0 0 0 1px rgba(35,50,82,0.5), 0 4px 20px rgba(0,0,0,0.25)",
        "card-hover": "0 0 0 1px rgba(62,214,166,0.2), 0 8px 32px rgba(0,0,0,0.35)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in": "slide-in 0.2s ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
