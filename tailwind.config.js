/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        walnut: {
          DEFAULT: '#3d2817',
          dark: '#2a1c10',
          light: '#5a3a22',
        },
        saddle: '#6b4423',
        caramel: '#c08850',
        cream: '#f4e8d0',
        ivory: '#fffff0',
        brass: {
          DEFAULT: '#b8860b',
          light: '#d4a017',
          dark: '#8b6508',
        },
        jazz: {
          green: '#5a8a3a',
          red: '#b54a3c',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'wood-grain': "url('/textures/wood-grain.svg')",
      },
      minHeight: {
        'tap': '44px',
      },
      minWidth: {
        'tap': '44px',
      },
    },
  },
  plugins: [],
}
