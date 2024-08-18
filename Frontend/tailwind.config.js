/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens : {
      'small' : '350px',
      'x-small' : '400px',
      'base' : '550px',
      'large' : '780px',
      'x-large' : '900px',
      'xx-large' : '1100px',
      'xxx-large' : '1200px',
      '4x-large' : '1600px',
      '5x-large' : '1800px',
    },
  },
  plugins: [],
}