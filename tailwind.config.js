/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      display: ['Orbitron'],
      sans: ['Tenor Sans'],
      mono: ['JetBrains Mono'],
    },
  },
  plugins: [require('daisyui')],
}
