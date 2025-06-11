/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      strokeWidth: {
        '4': '4px',
      }
    },
  },
  plugins: [],
  // Add support for arbitrary values
  corePlugins: {
    // Enable all core plugins
  }
}