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
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        hindi: ["var(--font-hindi)", "sans-serif"],
      },
      colors: {
        teal: {
          deep: "#0F4C4A",
          900: "#0F4C4A",
          800: "#135E5B",
          700: "#18726E",
          50: "#EDF7F6",
        },
        amber: {
          warm: "#F2A33A",
          accent: "#F2A33A",
          50: "#FEF7EC",
          100: "#FDEED5",
        },
        ink: {
          DEFAULT: "#12201F",
          light: "#2A3D3C",
          muted: "#607271",
        },
        offwhite: {
          DEFAULT: "#F7F5EF",
          surface: "#FFFFFF",
          border: "#E5E1D4",
          dark: "#0E1716",
          darkSurface: "#132120",
          darkBorder: "#1D3230",
        },
        coral: {
          DEFAULT: "#E05A47",
          50: "#FDF2F0",
          600: "#E05A47",
        },
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
