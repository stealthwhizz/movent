/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#FAFAF8',
        'card-border': '#E8E6E1',
        primary: '#2D6BE4',
        danger: '#E84444',
        warning: '#F5A623',
        success: '#22A95B',
        'text-primary': '#1A1916',
        'text-muted': '#7A7874',
        'rec-bg': '#EEF4FF',
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
};
