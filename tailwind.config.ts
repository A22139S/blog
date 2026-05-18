import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  // 启用深色模式（class 策略）
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
      },
      colors: {
        // 主题色板
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      typography: (theme: (key: string) => string) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.primary.600'),
              '&:hover': { color: theme('colors.primary.700') },
            },
            'h1,h2,h3,h4': { fontWeight: '700' },
            code: {
              color: theme('colors.pink.600'),
              backgroundColor: theme('colors.gray.100'),
              borderRadius: '0.25rem',
              padding: '0.125rem 0.375rem',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.primary.400'),
              '&:hover': { color: theme('colors.primary.300') },
            },
            'h1,h2,h3,h4': { color: theme('colors.gray.100') },
            code: {
              color: theme('colors.pink.400'),
              backgroundColor: theme('colors.gray.800'),
            },
            blockquote: {
              color: theme('colors.gray.400'),
              borderLeftColor: theme('colors.gray.600'),
            },
            hr: { borderColor: theme('colors.gray.700') },
            strong: { color: theme('colors.gray.100') },
          },
        },
      }),
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    typography,
  ],
}
export default config
