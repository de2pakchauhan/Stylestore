/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@headlessui/react/dist/components/**/*.js',
    './node_modules/@headlessui/tailwindcss/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5', // indigo-600
          dark: '#4338ca'      // indigo-700
        }
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),    // For better form element styling
    require('@tailwindcss/typography') // For prose content formatting
  ],
}