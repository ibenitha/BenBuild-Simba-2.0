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
        simba: {
          // Brand primary — orange (matches real Simba site)
          orange: "#F97316",
          "orange-dark": "#EA580C",
          "orange-light": "#FB923C",
          "orange-pale": "#FFF7ED",
          // Aliases so old "simba-green" references still compile
          green: "#F97316",
          "green-dark": "#EA580C",
          "green-light": "#FB923C",
          // Navy for dark backgrounds
          navy: "#1E293B",
          "navy-light": "#334155",
          // Accent green for in-stock badges only
          success: "#16A34A",
          yellow: "#F59E0B",
          "yellow-light": "#FCD34D",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-in": "bounceIn 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(10px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        bounceIn: { "0%": { transform: "scale(0.9)", opacity: "0" }, "60%": { transform: "scale(1.05)" }, "100%": { transform: "scale(1)", opacity: "1" } },
      },
    },
  },
  plugins: [],
};

export default config;
