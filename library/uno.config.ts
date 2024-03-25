// uno.config.ts
import { defineConfig, presetTypography, presetUno, presetWebFonts } from 'unocss'

export default defineConfig({
  cli: {
    entry: {
      patterns: ['../backends/go/site/*.go'],
      outFile: '../backends/go/site/static/css/site.css',
    },
  },
  presets: [
    presetUno(),
    presetTypography({
      cssExtend: {
        'code::before': {
          content: '"" !important',
        },
        'code::after': {
          content: '"" !important',
        },
      },
    }),
    presetWebFonts({
      customFetch: (url) => fetch(url).then((it) => it.data),
      provider: 'google',
      fonts: {
        sans: 'Inter',
        mono: 'Fira Code',
        brand: 'Orbitron',
      },
    }),
  ],
  rules: [['un-cloak', { display: 'block !important' }]],
  theme: {
    colors: {
      primary: {
        50: '#f8f4eb',
        100: '#f1e9d7',
        200: '#e4d3af',
        300: '#d6bd87',
        400: '#c9a75f',
        500: '#bb9137',
        600: '#96742c',
        700: '#705721',
        800: '#4b3a16',
        900: '#251d0b',
      },
      accent: {
        50: '#ebeff8',
        100: '#d7dff1',
        200: '#afc0e4',
        300: '#87a0d6',
        400: '#5f81c9',
        500: '#3761bb',
        600: '#2c4e96',
        700: '#213a70',
        800: '#16274b',
        900: '#0b1325',
      },
      success: {
        50: '#f0f9f4',
        100: '#e1f3e9',
        200: '#c3e7d2',
        300: '#a5dbbb',
        400: '#87cf9f',
        500: '#69c383',
        600: '#549f6a',
        700: '#3f7b51',
        800: '#2a5738',
        900: '#153b1f',
      },
      error: {
        50: '#f9f0f0',
        100: '#f3e1e1',
        200: '#e7c3c3',
        300: '#dba5a5',
        400: '#cf8787',
        500: '#c36969',
        600: '#9f5454',
        700: '#7b3f3f',
        800: '#57302a',
        900: '#3b1f15',
      },
    },
  },
})
