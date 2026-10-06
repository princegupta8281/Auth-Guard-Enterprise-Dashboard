/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        base: {
          50: '#f9f9fb',
          100: '#f1f1f5',
          200: '#e1e1e9',
          300: '#c7c7d5',
          400: '#a5a5ba',
          500: '#86869f',
          600: '#696983',
          700: '#535368',
          800: '#434354',
          900: '#3a3a46',
          950: '#0f0f13', // Deep Onyx
        },
        charcoal: {
          50: '#f9f9fb', 100: '#f1f1f5', 200: '#e1e1e9', 300: '#c7c7d5', 400: '#a5a5ba', 500: '#86869f', 600: '#696983', 700: '#535368', 800: '#434354', 900: '#3a3a46', 950: '#0f0f13'
        },
        primary: {
          400: '#818cf8',
          500: '#6366f1', // Indigo
          600: '#4f46e5',
        },
        accent: {
          400: '#fb7185',
          500: '#f43f5e', // Rose
          600: '#e11d48',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'float': '0 20px 40px -10px rgba(0,0,0,0.1)',
        'bento': '0 2px 10px rgba(0,0,0,0.02), 0 10px 40px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
