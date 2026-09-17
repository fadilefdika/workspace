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
        canvas: {
          light: '#FFFFFF',
          DEFAULT: '#F5F5F7',
          dark: '#000000',
          darkElevated: '#1C1C1E',
        },
        ink: {
          DEFAULT: '#1D1D1F',
          secondary: '#6E6E73',
          tertiary: '#86868B',
          inverted: '#F5F5F7',
        },
        separator: {
          light: 'rgba(0,0,0,0.08)',
          dark: 'rgba(255,255,255,0.12)',
        },
        accent: {
          DEFAULT: '#0071E3',
          hover: '#0077ED',
          subtle: '#E8F0FE',
        },
        success: '#34C759',
        warning: '#FF9F0A',
        danger: '#FF3B30',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        elevated: '0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.1)',
        focus: '0 0 0 4px rgba(0,113,227,0.25)',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
};
