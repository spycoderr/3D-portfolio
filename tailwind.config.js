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
      // Set at runtime from src/theme.ts (see useThemeVariables), so the UI
      // follows the dusk toggle and never drifts from the scene's palette.
      colors: {
        ink: 'rgb(var(--ui-ink) / <alpha-value>)',
        paper: 'rgb(var(--ui-paper) / <alpha-value>)',
        sky: 'rgb(var(--ui-sky) / <alpha-value>)',
        accent: 'rgb(var(--ui-accent) / <alpha-value>)',
        'on-accent': 'rgb(var(--ui-on-accent) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
