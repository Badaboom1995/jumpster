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
        primary: { DEFAULT: "#D2FA63", dark: "#A5C54C" },
        caption: { DEFAULT: "#848484" },
        background: { DEFAULT: "#292930", dark: "#1E1E24", light: "#4D4D5B" },
      },
      boxShadow: {
        glow: "0 0 22px 5px rgba(100, 100, 100, 0.8)",
      },
      keyframes: {
        flash: {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
        fade: {
          "0%": {
            opacity: "1",
            background: "rgba(210, 220, 60, 0.7)",
          },
          "20%": {
            opacity: "0.9",
            background: "rgba(0, 0, 0, 0.8)",
          },
          "100%": {
            opacity: "0",
          },
        },
        fadeReverse: {
          "0%": {
            opacity: "0",
          },
          "20%": {
            opacity: "0.2",
          },
          "100%": {
            opacity: "1",
          },
        },
        tremblingSoft: {
          "0%, 100%": { transform: "scale(1) translate(0, 0) rotate(0deg)" }, // Rest state
          "5%": { transform: "translate(-0.5px, 0.5px) rotate(-0.5deg)" },
          "10%": { transform: "translate(0.5px, -0.5px) rotate(0.5deg)" },
          "15%": { transform: "translate(-1px, 1px) rotate(-1deg)" },
          "20%": { transform: "translate(1.5px, -1.5px) rotate(1.5deg)" },
          "25%": { transform: "translate(-2px, 2px) rotate(-2deg)" },
          "30%": { transform: "translate(2.5px, -2.5px) rotate(2.5deg)" },
          "35%": { transform: "translate(-3px, 3px) rotate(-3deg)" },
          "40%": { transform: "translate(3.5px, -3.5px) rotate(3.5deg)" },
          "45%": { transform: "translate(-4px, 4px) rotate(-4deg)" },
          "50%": { transform: "translate(4.5px, -4.5px) rotate(4.5deg)" },
          "55%": { transform: "translate(-5px, 5px) rotate(-5deg)" },
          "60%": { transform: "translate(5.5px, -5.5px) rotate(5.5deg)" },
          "65%": { transform: "translate(-6px, 6px) rotate(-6deg)" },
          "70%": { transform: "scale(1.05) translate(3px, -3px) rotate(3deg)" }, // Peak intensity
          "80%": { transform: "translate(-2px, 2px) rotate(-2deg)" },
          "90%": { transform: "translate(1px, -1px) rotate(1deg)" },
          "95%": { transform: "translate(-0.5px, 0.5px) rotate(-0.5deg)" },
        },
        trembling: {
          "0%, 100%": {
            boxShadow: "0 0 5px 2px rgba(60, 60, 60, 0.5)",
            transform: "scale(1) translate(0, 0) rotate(0deg)",
          }, // Rest state
          "5%": { transform: "translate(-0.5px, 0.5px) rotate(-0.5deg)" },
          "10%": { transform: "translate(0.5px, -0.5px) rotate(0.5deg)" },
          "15%": { transform: "translate(-1px, 1px) rotate(-1deg)" },
          "20%": { transform: "translate(1.5px, -1.5px) rotate(1.5deg)" },
          "25%": { transform: "translate(-2px, 2px) rotate(-2deg)" },
          "30%": { transform: "translate(2.5px, -2.5px) rotate(2.5deg)" },
          "35%": { transform: "translate(-3px, 3px) rotate(-3deg)" },
          "40%": { transform: "translate(3px, -3px) rotate(3deg)" },
          "45%": { transform: "translate(-3px, 3px) rotate(-3deg)" },
          "50%": { transform: "translate(3px, -3px) rotate(3deg)" },
          "55%": {
            boxShadow: "0 0 6px 2px rgba(60, 60, 60, 0.8)",
            transform: "translate(-3px, 3px) rotate(-3deg)",
          },
          "65%": { transform: "translate(-3px, 3px) rotate(-3deg)" },
          "70%": {
            boxShadow: "0 0 18px 0px rgba(130, 150, 80, 1)",
            transform: "scale(1.1) translate(3px, -3px) rotate(3deg)",
          }, // Peak intensity
          "80%": { transform: "translate(-2px, 2px) rotate(-2deg)" },
          "90%": { transform: "translate(1px, -1px) rotate(1deg)" },
          "95%": { transform: "translate(-0.5px, 0.5px) rotate(-0.5deg)" },
        },
        scale: {
          "0%": {
            transform: "scale(1)",
          },
          "70%": {
            transform: "scale(1.05)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
        keyframes: {
          tilt: {
            "0%, 50%, 100%": {
              transform: "rotate(0deg)",
            },
            "25%": {
              transform: "rotate(0.5deg)",
            },
            "75%": {
              transform: "rotate(-0.5deg)",
            },
          },
        },
        movingGradient: {
          "0%": {
            backgroundPosition: "0%, 50%",
          },
          "100%": {
            backgroundPosition: "100%, 50%",
          },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 5px 2px rgba(60, 60, 60, 0.5)",
          },
          "50%": {
            boxShadow: "0 0 8px 5px rgba(100, 100, 100, 0.8)",
          },
        },
      },
      animation: {
        flash: "flash 1s ease-in-out 0.25s 3",
        glow: "glow 5s ease infinite",
        movingGradient: "movingGradient 1s ease infinite",
        tilt: "tilt 1s ease-in-out 0.25s 3",
        fade: "fade 4s ease-in-out 0.25s 3",
        fadeReverse: "fadeReverse 1s ease 1",
        tremblingSoft: "tremblingSoft 1.2s ease-in-out 0.25s 1",
        trembling: "trembling 2.7s ease-in-out 0.25s 1",
        scale: "scale 1.2s ease-in-out 0.25s 1",
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
