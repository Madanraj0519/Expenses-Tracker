/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '420px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Backward-compatibility keys
      'small': '350px',
      'x-small': '400px',
      'base': '550px',
      'large': '780px',
      'x-large': '900px',
      'xx-large': '1100px',
      'xxx-large': '1200px',
    },
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        dark: {
          bg: '#0a0e17',
          card: '#111827',
          border: '#1f2937',
        }
      },
      boxShadow: {
        'glow-green': '0 0 25px -5px rgba(34, 197, 94, 0.25)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.25)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}