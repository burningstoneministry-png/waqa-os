/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0d0f1a',
          800: '#131625',
          700: '#1a1d2e',
          600: '#222640',
          500: '#2d3154',
        },
        brand: {
          DEFAULT: '#4f8ef7',
          dark: '#3b7af0',
        },
        // Keep legacy aliases for backward compat
        background: '#0d0f1a',
        foreground: '#f1f5f9',
        sidebar: '#131625',
        card: '#1a1d2e',
        accent: '#fbbf24',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)',
        'card-lg': '0 4px 16px 0 rgba(0,0,0,0.4)',
        'blue-glow': '0 0 20px rgba(79, 142, 247, 0.2)',
        'green-glow': '0 0 20px rgba(110, 231, 183, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
