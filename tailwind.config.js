/** @type {import('tailwindcss').Config} */
module.exports = {
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#8766e2",
          "secondary": "#29a6bc",
          "accent": "#e595d6",
          "neutral": "#222F3F",
          "base-100": "#425057",
          "info": "#73B5DD",
          "success": "#1AC779",
          "warning": "#F6B32C",
          "error": "#F1466E",
        },
      },
    ],
  },
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  },
  plugins: [require("daisyui")],
}
