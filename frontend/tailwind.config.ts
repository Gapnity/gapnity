import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0A0B10",
          elevated: "#101218",
          card: "#141722",
          hover: "#1A1E2B",
        },
        border: {
          subtle: "#1E2230",
          default: "#272C3C",
          strong: "#353B50",
        },
        ink: {
          primary: "#E8ECF5",
          secondary: "#9CA3B4",
          muted: "#5B6278",
        },
        accent: {
          DEFAULT: "#7C5CFF",  // primary indigo-violet
          hover: "#8F72FF",
          soft: "#2B2147",
        },
        emerald: {
          DEFAULT: "#34D399",
          soft: "#0F3D30",
        },
        amber: {
          DEFAULT: "#FBBF24",
          soft: "#3D2E0A",
        },
        rose: {
          DEFAULT: "#F87171",
          soft: "#3D1818",
        },
        sky: {
          DEFAULT: "#38BDF8",
          soft: "#0E2E42",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "card": "0 1px 2px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.04)",
        "glow": "0 0 0 1px rgba(124,92,255,.35), 0 8px 32px -8px rgba(124,92,255,.45)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.03) 1px, transparent 1px)",
        "accent-gradient":
          "linear-gradient(135deg, #7C5CFF 0%, #38BDF8 100%)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
    },
  },
  plugins: [],
};
export default config;
