/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDFBF7', 100: '#F5F2EA', 200: '#EAE4D6',
          300: '#D4C9B3', 400: '#A39171', 500: '#8B7A5E',
          600: '#6B5D4A', 700: '#4A3F32',
          800: '#5C4F3C', 900: '#3F3931',
        },
        stage: {
          prep: '#10B981', create: '#F59E0B',
          dev: '#3B82F6', mature: '#8B5CF6',
        },
      },
    },
  },
  plugins: [],
};
