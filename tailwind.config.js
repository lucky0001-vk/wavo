/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          950: '#08090B', // Near black main background
          900: '#0E1015',
          850: '#14161B', // Dark charcoal card surface
          800: '#1B1E26',
          750: '#222631',
          700: '#2A303D',
          600: '#3E4656',
          500: '#64748B',
          400: '#94A3B8', // Muted secondary text
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC', // Soft white primary text
        },
        amber: {
          cinema: '#D6A85F', // Signature warm amber accent
          hover: '#E5BA75',
          glow: 'rgba(214, 168, 95, 0.25)',
          muted: 'rgba(214, 168, 95, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-amber': '0 0 25px -5px rgba(214, 168, 95, 0.3)',
        'glow-amber-lg': '0 0 45px -8px rgba(214, 168, 95, 0.45)',
        'cinema-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up': 'floatUp 2.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-120px) scale(1.4)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
