import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        kujuana: {
          purple: {
            950: '#18021F',
            900: '#2A0838',
            800: '#3B0F4F',
            700: '#4A1663', // optional card purple
          },
          gold: {
            500: '#D4AF37',
            600: '#C9A227',
            300: '#E8D27C',
            200: '#F5E6B3',
          },
          ink: '#0B0A10',
        },
      },
      backgroundImage: {
        'kujuana-gold': 'linear-gradient(135deg, #E8D27C, #D4AF37, #C9A227)',
        'kujuana-night': 'linear-gradient(180deg, #3B0F4F, #2A0838)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(232, 210, 124, 0.35), 0 10px 30px rgba(24, 2, 31, 0.55)',
        soft: '0 10px 30px rgba(24, 2, 31, 0.35)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s ease infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config