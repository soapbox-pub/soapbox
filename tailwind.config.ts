import aspectRatioPlugin from '@tailwindcss/aspect-ratio';
import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';
import { type Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

import { parseColorMatrix } from './tailwind/colors.ts';

const blackVariantPlugin = plugin(({ addVariant }) => addVariant('black', '.black.black &'));

const config: Config = {
  content: ['./src/**/*.{html,js,ts,tsx}', './custom/instance/**/*.html', './index.html'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '581px',
      md: '768px',
      lg: '976px',
      xl: '1280px',
    },
    extend: {
      boxShadow: ({ theme }) => ({
        '3xl': '0 25px 75px -15px rgba(0, 0, 0, 0.25)',
        'inset-ring': `inset 0 0 0 2px ${theme('colors.accent-blue')}`,
        'card': `rgba(0, 0, 0, 0.35, 0.1) 0px 4px 16px, 
                   rgba(0, 0, 0, 0.35, 0.1) 0px 8px 24px, 
                   rgba(0, 0, 0, 0.35, 0.1) 0px 16px 56px`,
        'card-inset': 'rgba(0, 0, 0, 0.60) 0px -120px 36px -28px inset',
      }),
      fontSize: {
        base: '0.9375rem',
      },
      fontFamily: {
        arabic: [
          'Vazirmatn',
          'Cairo',
          'Amiri',
          'Tajawal',
          'sans-serif',
        ],
        javanese: [
          'Noto Sans Javanese',
          'serif',
        ],
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        mono: [
          'Roboto Mono',
          'ui-monospace',
          'mono',
        ],
        emoji: [
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Segoe UI',
          'Apple Color Emoji',
          'Twemoji Mozilla',
          'Noto Color Emoji',
          'Android Emoji',
        ],
      },
      spacing: {
        '4.5': '1.125rem',
      },
      colors: parseColorMatrix({
        // Define color matrix (of available colors)
        // Colors are configured at runtime with CSS variables in soapbox.json
        gray: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        primary: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        secondary: [100, 200, 300, 400, 500, 600],
        success: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        danger: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        accent: [300, 500],
        'accent-blue': true,
        'gradient-start': true,
        'gradient-end': true,
        'greentext': true,
      }),
      animation: {
        'loader-figure': 'loader-figure 1.15s infinite cubic-bezier(0.215, 0.61, 0.355, 1)',
        'loader-label': 'loader-label 1.15s infinite cubic-bezier(0.215, 0.61, 0.355, 1)',
        fade: 'fade 150ms linear',
        'sonar-scale-4': 'sonar-scale-4 3s linear infinite',
        'sonar-scale-3': 'sonar-scale-3 3s 0.5s linear infinite',
        'sonar-scale-2': 'sonar-scale-2 3s 1s linear infinite',
        'sonar-scale-1': 'sonar-scale-1 3s 1.5s linear infinite',
        'enter': 'enter 200ms ease-out',
        'leave': 'leave 150ms ease-in forwards',
      },
      keyframes: {
        'loader-figure': {
          '0%': {
            backgroundColor: 'rgb(229, 231, 235)',
            width: '0px',
            height: '0px',
          },

          '29%': {
            backgroundColor: 'rgb(229, 231, 235)',
          },

          '30%': {
            width: '3rem',
            height: '3rem',
            backgroundColor: 'transparent',
            opacity: '1',
            borderWidth: '6px',
          },

          '100%': {
            width: '3rem',
            height: '3rem',
            borderWidth: '0',
            opacity: '0',
            backgroundColor: 'transparent',
          },
        },
        'loader-label': {
          '0%': { opacity: '0.25' },
          '30%': { opacity: '1' },
          '100%': { opacity: '0.25' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'sonar-scale-4': {
          from: { opacity: '0.4', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(4)' },
        },
        'sonar-scale-3': {
          from: { opacity: '0.4', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(3.5)' },
        },
        'sonar-scale-2': {
          from: { opacity: '0.4', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(3)' },
        },
        'sonar-scale-1': {
          from: { opacity: '0.4', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(2.5)' },
        },
        enter: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        leave: {
          from: { transform: 'scale(1)', opacity: '1' },
          to: { transform: 'scale(0.9)', opacity: '0' },
        },
      },
    },
  },
  plugins: [
    aspectRatioPlugin,
    formsPlugin,
    typographyPlugin,
    blackVariantPlugin,
  ],
};

export default config;