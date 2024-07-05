/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        blue_moonstone: '#53A2BE',
        blue_ncs: '#1D84B5',
        blue_lapis: '#176087',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
