import type { Config } from "tailwindcss";

const config: Config | any = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT:'#D2FA63', dark: "#A5C54C"},
        background:{ DEFAULT:'#292930', dark: "#1E1E24", light: "#4D4D5B"},
      },
      boxShadow: {
        'glow': '0 35px 60px -15px rgba(210 250 99, 0.5)',
      },
      keyframes: {
        flash: {
          "0%, 100%": {
            opacity: "1"
          },
          "50%": {
            opacity: "0.8"
          },
        },
        movingGradient: {
            "0%": {
                backgroundPosition: "0%, 50%"
            },
            "100%": {
              backgroundPosition: "100%, 50%"
            }
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 5px 2px rgba(60, 60, 60, 0.5)'
          },
          '50%': {
            boxShadow: '0 0 12px 5px rgba(100, 100, 100, 0.8)'
          }
        },
      },
      animation: {
        flash: "flash 1s ease-in-out 0.25s 3",
        glow: "glow 3s ease infinite",
        movingGradient: "movingGradient 1s ease infinite"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
