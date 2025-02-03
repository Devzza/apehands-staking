import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'blue01': '#0154fa',
        'blue02': "4986fb",
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        titan: ['Titan One', 'serif'],
      },

    },
  },
  plugins: [],
} satisfies Config;
