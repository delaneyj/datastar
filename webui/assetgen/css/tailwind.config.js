/** @type {import('tailwindcss').Config} */
module.exports = {
  // darkMode: "class",
  content: {
    files: ["../../**/*.go"],
  },
  plugins: [
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/typography"),
    require("daisyui"),
    require("tailwind-scrollbar-daisyui"),
  ],
  theme: {
    fontFamily: {
      display: ["Orbitron, sans-serif"],
      sans: ["Inter, sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
  },
  daisyui: {
    themes: [
      {
        gruvbox: {
          primary: "#458588",
          "primary-content": "#fbf1c7",
          secondary: "#d65d0e",
          "secondary-content": "#fbf1c7",
          accent: "#f7a41d",
          "accent-content": "#141414",
          neutral: "#928374",
          "neutral-content": "282828",
          "base-100": "#282828",
          "base-200": "#3c3836",
          "base-300": "#504945",
          "base-content": "#fbf1c7",
          info: "#83a598",
          success: "#8ec07c",
          warning: "#fabd2f",
          error: "#fb4934",
        },
      },
    ],
  },
};
