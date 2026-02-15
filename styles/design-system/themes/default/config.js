// Default Theme Configuration
// Clean Shadcn-style with custom Brand Blue color family
// Real JSON data - gets wrapped in <script> tags by the main config.js

export const themeName = 'default';
export const themeDescription = 'Default Theme - Clean Shadcn-style with Brand Blue';

// Typography Configuration
export const typography = {
  fonts: {
    sans: {
      name: 'System UI',
      value: "-apple-system, system-ui, Inter, Roboto, 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
      usage: 'Default for all interfaces'
    },
    mono: {
      name: 'System Mono',
      value: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace",
      usage: 'Code blocks, terminal output'
    },
    display: {
      name: 'System UI',
      value: "-apple-system, system-ui, sans-serif",
      usage: 'Headlines, hero sections'
    },
    marketing: {
      name: 'System UI',
      value: "-apple-system, system-ui, sans-serif",
      usage: 'Marketing body copy'
    },
    serif: {
      name: 'System Serif',
      value: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
      usage: 'Editorial, long-form content'
    }
  },
  googleFontsImport: null  // Default uses system fonts
};

// Custom Color Palettes
export const customColors = {
  'brand': {
    name: 'Brand Blue',
    palette: {
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
      950: '#172554',
    }
  }
};

// Semantic Colors (buttons, alerts, etc.)
export const semanticColors = {
  primary: {
    name: 'Primary',
    base: '#3b82f6',    // brand-500
    hover: '#2563eb',   // brand-600
    active: '#1d4ed8',  // brand-700
    text: '#ffffff'
  },
  secondary: {
    name: 'Secondary',
    base: '#eff6ff',    // brand-50
    hover: '#dbeafe',   // brand-100
    active: '#bfdbfe',  // brand-200
    text: '#3b82f6',    // brand-500
    border: '#3b82f6'
  },
  tertiary: {
    name: 'Tertiary',
    base: 'transparent',
    hover: '#f8fafc',   // slate-50
    active: '#f1f5f9',  // slate-100
    text: '#3b82f6',    // brand-500
    border: '#3b82f6'
  }
};

// Tailwind extend config - just the colors/fonts extension
export const tailwindExtend = {
  fontFamily: {
    'sans': 'var(--font-sans)',
    'mono': 'var(--font-mono)',
    'serif': 'var(--font-serif)',
    'display': 'var(--font-display)',
    'marketing': 'var(--font-marketing)',
  },
  colors: {
    'accent': 'var(--color-accent)',
    'success': 'var(--color-success)',
    'warning': 'var(--color-warning)',
    'danger': 'var(--color-danger)',
    'info': 'var(--color-info)',
  }
};

// Full theme config object for export
export const themeConfig = {
  themeName,
  themeDescription,
  typography,
  customColors,
  semanticColors,
  tailwindExtend
};

export default themeConfig;

