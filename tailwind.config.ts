import type { Config } from "tailwindcss";

const config: {
  plugins: any[];
  theme: {
    extend: {
      keyframes: { flash: { "0%, 100%": { opacity: string }; "50%": { opacity: string } } };
      backgroundImage: { "gradient-conic": string; "gradient-radial": string };
      animation: { flash: string }
    }
  };
  content: string[]
} = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        flash: {
          "0%, 100%": {
            opacity: "1"
          },
          "50%": {
            opacity: "0.8"
          },
        },
      },
      animation: {
        flash: "flash 1s ease-in-out 0.25s 3",
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
