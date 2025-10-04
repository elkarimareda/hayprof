import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        hayprof: {
          "deep-blue": "#4955A5",
          "bright-yellow": "#FED628",
          "light-blue": "#6B75C7",
          "soft-yellow": "#FFF4A3",
          // Readable gray text colors
          "text-primary": "#1f2937", // Very dark gray for headings
          "text-secondary": "#374151", // Dark gray for body text
          "text-muted": "#6b7280", // Medium gray for muted text
        },
      },
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "float-medium": "float 4s ease-in-out infinite",
        "bounce-slow": "bounce 3s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
