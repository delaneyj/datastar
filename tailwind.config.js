/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      display: ['Orbitron, sans-serif'],
      sans: ['Inter, sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
  },
  daisyui: {
    themes: ['light', 'dark', 'night'],
  },
  plugins: [require('daisyui')],
}
