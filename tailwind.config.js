/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F4EE',
        ink: '#2B2A28',
        rule: '#DDD7CC',
        tag: '#E8622C',
        steel: '#3D5A6C',
        ok: '#4F7942',
        alert: '#C0392B',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
