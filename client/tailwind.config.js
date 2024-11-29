/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f3faf7',
          100: '#d8f3ec',
          200: '#b3e6d9',
          300: '#84d3c2',
          400: '#56baa6',
          500: '#399782',
          600: '#2d7a68',
          700: '#266155',
          800: '#214e45',
          900: '#1d3f3a',
        },
        earth: {
          50: '#faf6f3',
          100: '#f0e6e0',
          200: '#e0cdc1',
          300: '#cca895',
          400: '#b68468',
          500: '#a06c4e',
          600: '#8c5b40',
          700: '#724a36',
          800: '#5e3d2f',
          900: '#4e3328',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        naturetheme: {
          primary: "#399782",
          secondary: "#a06c4e",
          accent: "#0ea5e9",
          neutral: "#1d3f3a",
          "base-100": "#f3faf7",
          info: "#7dd3fc",
          success: "#84d3c2",
          warning: "#cca895",
          error: "#b68468",
        }
      },
      {
        mytheme: {
          primary: "#9700ff",
          secondary: "#cf0000",
          accent: "#00a3ff",
          neutral: "#0c041a",
          "base-100": "#fffde9",
          info: "#0077f2",
          success: "#98d300",
          warning: "#f0a100",
          error: "#ff396b",
        }
      }
    ]
  }
}