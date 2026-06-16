/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8B5CF6', // Soft purple
          DEFAULT: '#7C3AED', // Pure Purple
          dark: '#6D28D9', // Dark Violet
        },
        darkBg: '#0A0516', // Neon glow slate-black
        glassBg: 'rgba(255, 255, 255, 0.45)',
        glassBorder: 'rgba(255, 255, 255, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        // Core custom Claymorphism double-inner shadows
        'clay-light': '3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(0, 0, 0, 0.12), inset 3px 3px 6px rgba(255, 255, 255, 0.9)',
        'clay-dark': '3px 3px 10px rgba(0, 0, 0, 0.45), inset -3px -3px 6px rgba(0, 0, 0, 0.4), inset 3px 3px 6px rgba(255, 255, 255, 0.06)',
        'neon': '0 0 15px rgba(124, 58, 237, 0.4), 0 0 30px rgba(124, 58, 237, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'spin-slow': 'spin 15s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, filter: 'drop-shadow(0 0 4px rgba(124, 58, 237, 0.3))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 12px rgba(124, 58, 237, 0.7))' },
        }
      }
    },
  },
  plugins: [],
}
