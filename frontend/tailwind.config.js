/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdf9f0',
          100: '#faf0d7',
          200: '#f5e0ae',
          300: '#edc97a',
          400: '#e4b44d',
          500: '#c9a96e',
          600: '#b8965a',
          700: '#9a7a45',
          800: '#7d6238',
          900: '#5c4826',
        },
        navy: {
          50: '#f0f0f5',
          100: '#d9d9e8',
          200: '#b3b3d1',
          300: '#8080b0',
          400: '#4d4d8f',
          500: '#1a1a2e',
          600: '#16213e',
          700: '#0f3460',
          800: '#0a0a1a',
          900: '#050510',
        },
        cream: '#fafaf8',
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", 'Georgia', 'serif'],
        sans: ["'DM Sans'", 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'bounce-slow': 'bounce 2s infinite',
        'flicker': 'flicker 2s ease infinite',
        'pop-in': 'popIn 0.5s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        flicker: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        popIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'gold': '0 4px 24px rgba(201,169,110,0.25)',
        'gold-lg': '0 8px 40px rgba(201,169,110,0.35)',
        'navy': '0 4px 24px rgba(26,26,46,0.15)',
        'navy-lg': '0 8px 40px rgba(26,26,46,0.25)',
      },
    },
  },
  plugins: [],
}