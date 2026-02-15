/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "../index.html",
    "../main.tsx",
    "./app.scss",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg-page)',
        foreground: 'var(--color-text-primary)',
        muted: {
          DEFAULT: 'var(--color-bg-muted)',
          foreground: 'var(--color-text-muted)',
        },
        card: {
          DEFAULT: 'var(--color-bg-card)',
        },
        primary: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-text-on-dark)',
          hover: 'var(--color-accent-hover)',
          light: 'var(--color-accent-light)',
        },
        secondary: {
          DEFAULT: 'var(--color-bg-secondary)',
          foreground: 'var(--color-text-secondary)',
        },
        border: 'var(--color-border)',
        ring: 'var(--color-accent)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
