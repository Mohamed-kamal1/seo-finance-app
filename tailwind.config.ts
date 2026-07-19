import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        panel: "#111A2C",
        panel2: "#16233B",
        line: "#233252",
        accent: "#3ED6A6",
        accent2: "#F2B84B",
        danger: "#F0654F",
        muted: "#8CA0C4",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
