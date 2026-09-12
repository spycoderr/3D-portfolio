/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'step-0': '13px',
        'step-1': '15px',
        'step-2': '18px',
        'step-3': '24px',
        'step-4': '34px',
        'step-5': '56px',
        'step-6': '84px',
      },
      maxWidth: {
        prose: '66ch',
      },
      colors: {
        sky: '#cfe0ea',
        grass: '#8fb56a',
        'grass-dark': '#6f9a55',
        road: '#5f6771',
        kerb: '#cfc9b8',
        sand: '#e6ddca',
        brick: '#c2603f',
        slate: '#37506b',
        moss: '#4e7a4a',
        ink: '#1d2430',
        paper: '#f3efe6',
      },
    },
  },
  plugins: [],
}
