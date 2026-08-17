// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'DM Sans', 'system-ui', 'sans-serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        forest: { 50: '#E6F4ED', 100: '#C2E6D4', 500: '#0F5C42', 700: '#0A3D2B' },
        coral:  { 50: '#FFF0EE', 500: '#FF6B5E', 700: '#E55245' },
        sand:   { 50: '#FDFAF5', 100: '#F7F4EF', 200: '#EDE8DF' },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        sm:   '0 1px 3px rgba(0,0,0,0.06)',
        md:   '0 4px 12px rgba(0,0,0,0.08)',
        lg:   '0 8px 30px rgba(0,0,0,0.12)',
        glow: '0 4px 20px rgba(15,92,66,0.35)',
      },
      keyframes: {
        fadeUp:  { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        popIn:   { '0%': { opacity: '0', transform: 'scale(0.88)' }, '70%': { transform: 'scale(1.04)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        spin:    { to: { transform: 'rotate(360deg)' } },
        pulse:   { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      animation: {
        'fade-up':  'fadeUp 0.35s ease both',
        'fade-in':  'fadeIn 0.25s ease both',
        'pop-in':   'popIn 0.3s ease both',
        'shimmer':  'shimmer 1.5s infinite',
        'float':    'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
