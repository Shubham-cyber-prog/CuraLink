/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Primary accent
          700: '#0f766e', // Primary hover/pressed
          800: '#115e59',
          900: '#134e4a',
        },
        charcoal: '#1E293B',    // Warm charcoal — headings (matches web)
        muted: '#64748B',       // Soft slate gray — body text
        accent: '#0891B2',      // Teal-cyan blend — icons, highlights
        border: '#E2E8F0',      // Border color
        'mint-bg': '#F0FDFA',   // Light mint for alternate sections/cards
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
}
