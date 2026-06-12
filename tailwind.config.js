/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        airbnb: '#FF385C',
        airbnbDark: '#D90B30',
        textDark: '#222222',
        textLight: '#717171',
      }
    },
  },
  plugins: [],
}