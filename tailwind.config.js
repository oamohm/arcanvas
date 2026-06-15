/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        arc: {
          bg:      '#080c14',
          surface: '#0d1422',
          border:  '#1a2540',
          cyan:    '#00e5ff',
          purple:  '#a259ff',
          green:   '#00c896',
          warn:    '#f59e0b',
          danger:  '#ff4466',
        }
      },
      fontFamily: { mono: ['ui-monospace', 'SFMono-Regular', 'monospace'] }
    }
  },
  plugins: [],
};
