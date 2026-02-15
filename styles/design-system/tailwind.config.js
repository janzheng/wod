/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Playground HTML files
    "../../playground/**/*.html",
    "../../playground/**/*.js",
    // Package component demos
    "../components/**/*.html",
    "../components/**/*.ts",
    // Apps
    "../../apps/**/*.html",
    "../../apps/**/*.ts",
  ],
  theme: {
    extend: {
      // Groq Theme Colors
      // Map to CSS variables for dynamic theming
      colors: {
        // Groq Orange (Primary Brand)
        'groq-orange': {
          50: '#fff5e5',
          100: '#ffe8cc',
          200: '#ffd1a3',
          300: '#ffb973',
          400: '#fe9e20',
          500: '#f48b0a',
          600: '#f43e01', // Main brand color
          700: '#c23101',
          800: '#9a2701',
          900: '#731d00',
          DEFAULT: '#f43e01', // Main brand
        },
        // Groq Gray (Neutral) - matches original palette
        'groq-gray': {
          50: '#ffffff',
          100: '#f3f3ee',
          200: '#e5e5dc',
          300: '#cecebf',
          400: '#9a9a8c',
          500: '#69695d',
          600: '#4a4a42',
          700: '#2d2f33',
          800: '#26292e',
          900: '#1a1c1f',
          950: '#000000',
          DEFAULT: '#26292e', // Primary text
        },
        // Groq Yellow (Extended)
        'groq-yellow': {
          200: '#f4fd90',
          300: '#fdeb20',
          500: '#e6d000',
          700: '#c6b802',
          DEFAULT: '#fdeb20',
        },
        // Groq Green (Extended)
        'groq-green': {
          200: '#a9ffdb',
          300: '#10e68d',
          500: '#0dcc7a',
          700: '#018b01',
          DEFAULT: '#10e68d',
        },
        // Groq Blue (Extended)
        'groq-blue': {
          200: '#bfe4fc',
          300: '#5fc0ff',
          500: '#0082a0',
          DEFAULT: '#5fc0ff',
        },
        // Groq Purple (Extended)
        'groq-purple': {
          200: '#e3dcf8',
          300: '#d377fd',
          500: '#683d7f',
          DEFAULT: '#d377fd',
        },
        // Groq Pink (Extended)
        'groq-pink': {
          200: '#fad8ff',
          300: '#f392dd',
          500: '#ee66ce',
          DEFAULT: '#f392dd',
        },
        // Semantic color aliases (map to CSS variables for dynamic theming)
        'primary': 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'accent': 'var(--color-accent)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'danger': 'var(--color-danger)',
        'info': 'var(--color-info)',
      },
    },
  },
  plugins: [],
}

