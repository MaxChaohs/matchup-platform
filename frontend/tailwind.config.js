/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#FFF5E6',
          panel: '#2D2D2D',
          button: '#10B981',
        },
      },
    },
  },
  plugins: [],
}

