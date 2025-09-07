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
          'deep-blue': '#4955A5',
          'bright-yellow': '#FED628', 
          'light-blue': '#6B75C7',
          'soft-yellow': '#FFF4A3',
          // Readable gray text colors
          'text-primary': '#1f2937',   // Very dark gray for headings
          'text-secondary': '#374151', // Dark gray for body text
          'text-muted': '#6b7280',     // Medium gray for muted text
        }
      }
    },
  },
  plugins: [],
};

export default config;
