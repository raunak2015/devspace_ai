/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        "primary": "#277bf1",
        "background-light": "#f6f7f8",
        "background-dark": "#101722",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
