/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        logo: ['Cinzel', 'serif'],
        editorial: ['Syne', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0a0a0c',
          card: '#ffffff',
          surface: '#f7f7f9',
          muted: '#8c8c9a',
          secondary: '#52525e',
          accent: '#18181b',
        },
      },
      boxShadow: {
        'liquid': '0 12px 36px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
        'liquid-hover': '0 18px 48px rgba(0, 0, 0, 0.09), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 1)',
        'modal': '0 24px 70px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        'liquid': '18px',
      },
    },
  },
  plugins: [],
};
