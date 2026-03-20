/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './app.js'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#0A0A0B',
        surface: '#111114',
        card: '#19191E',
        border: '#25252D',
        'accent-dim': '#1E3050',
        accent: '#28406E',
        'accent-hi': '#4168AF',
        'accent-text': '#7DA3E0',
        'accent-lt': '#A3C2EF',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
