/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Stitch Soft Red Gamified System / Vibrant Hearth Design Tokens
        primary: {
          DEFAULT: '#b52330',          // Primary Red
          container: '#ff5a5f',        // Appetizing Warm Coral Red
          dim: '#ffb3b0',
          dark: '#61000e',
        },
        secondary: {
          DEFAULT: '#8e4e14',          // Secondary Harvest Orange
          container: '#ffab69',        // Secondary Container Orange
          dark: '#783d01',
        },
        tertiary: {
          DEFAULT: '#166b47',          // Garden Green
          container: '#55a37a',        // Garden Container
          dark: '#00341f',
        },
        surface: {
          DEFAULT: '#fff8ef',          // Hearth Cream Surface
          dim: '#e1d9cb',
          bright: '#fff8ef',
          low: '#fbf3e4',
          container: '#f5edde',
          high: '#efe7d9',
          highest: '#e9e2d3',
          white: '#ffffff',
        },
        'on-surface': {
          DEFAULT: '#1e1b13',          // Warm dark text
          variant: '#5a403f',          // Muted text
        },
        outline: {
          DEFAULT: '#8e706f',
          variant: '#e2bebc',
        },
        streak: {
          gold: '#FFC107',             // Streak / XP Gold
        },
        status: {
          open: '#16A34A',
          closed: '#DC2626',
        },
        background: '#fff8ef',
        cream: {
          DEFAULT: '#fff8ef',
          low: '#fbf3e4',
          container: '#f5edde',
          white: '#ffffff',
          linen: '#fbf3e4',
          beige: '#ffffff',
        },
        flamered: '#b52330',
        flameorange: '#8e4e14',
        espresso: '#b52330',
        borderflame: '#e2bebc',
        gold: {
          DEFAULT: '#FFC107',
          soft: '#ffdcc4',
          light: '#ffab69',
        },
        warmgray: '#5a403f',
        borderbrown: '#e2bebc',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'System', 'sans-serif'],
        sans: ['Inter', 'System', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
