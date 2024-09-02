/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['../**/*.md', '../**/*.templ', '../**/*.go'],
  theme: {
    extend: {
      colors: {
        discord: '#5865F2',
        github: '#333',
      },
    },
    fontFamily: {
      sans: 'Inter',
      mono: 'Fira Code',
      brand: 'Orbitron',
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    require('daisyui'),
    require('tailwind-scrollbar'),
  ],
  daisyui: {
    themes: [
      {
        datastar: {
          primary: '#c9a75f',
          secondary: '#bfdbfe',
          accent: '#7dd3fc',
          neutral: '#444',
          'neutral-content': '#fff',
          'base-100': '#0b1325',
          'base-200': '#1e304a',
          'base-300': '#3a506b',
          info: '#0369a1',
          success: '#69c383',
          warning: '#facc15',
          error: '#e11d48',
        },
      },
    ],
  },
}
