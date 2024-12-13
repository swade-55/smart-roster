/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        corporate: {
          primary: "#2563eb",        // Blue 600
          secondary: "#16a34a",      // Green 600
          accent: "#c026d3",         // Purple 600
          neutral: "#1e293b",        // Slate 800
          "base-100": "#f8fafc",     // Slate 50
          info: "#60a5fa",          // Blue 400
          success: "#4ade80",       // Green 400
          warning: "#f59e0b",       // Amber 500
          error: "#ef4444",         // Red 500

          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "0.5rem",

          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",

          "--btn-text-case": "normal-case",
          "--navbar-padding": "1rem",
        },
        dark: {
          primary: "#3b82f6",        // Blue 500
          secondary: "#22c55e",      // Green 500
          accent: "#d946ef",         // Purple 500
          neutral: "#0f172a",        // Slate 900
          "base-100": "#1e293b",     // Slate 800
          info: "#93c5fd",          // Blue 300
          success: "#86efac",       // Green 300
          warning: "#fcd34d",       // Amber 300
          error: "#f87171",         // Red 300

          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "0.5rem",

          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",

          "--btn-text-case": "normal-case",
          "--navbar-padding": "1rem",
        }
      }
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
    themeRoot: ":root"
  }
}