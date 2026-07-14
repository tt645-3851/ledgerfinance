/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5EF',
        paperDim: '#EFEBE0',
        ink: '#1B2430',
        inkSoft: '#4A5568',
        ledger: {
          DEFAULT: '#2F5D50',
          light: '#3E7A6A',
          dark: '#1F4038',
        },
        debt: {
          DEFAULT: '#B3452C',
          light: '#C8654A',
        },
        gold: '#C9A227',
        line: '#D8D3C7',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
}
