/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Lato', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        ocher: {
          50:  '#FDF5E8',
          100: '#FAE6C4',
          200: '#F5CC89',
          300: '#E8AD55',
          400: '#D9993A',
          500: '#CF9033',
          600: '#CF9033',
          700: '#A86E20',
          800: '#7F5318',
          900: '#573A11',
          950: '#2E1E09',
        },
      },
    },
  },
  plugins: [],
}
