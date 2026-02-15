// Groq Theme Configuration
// Real JSON data - gets wrapped in <script> tags by the main config.js

export const themeName = 'groq';
export const themeDescription = 'Groq - Fast AI Inference Platform Style';

// Typography Configuration
export const typography = {
  fonts: {
    sans: {
      name: 'System UI',
      value: "-apple-system, system-ui, Inter, Roboto, 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
      usage: 'Default for app interfaces'
    },
    mono: {
      name: 'IBM Plex Mono',
      value: "'IBM Plex Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace",
      usage: 'Code blocks, terminal output',
      weight: 300  // Light weight for better readability
    },
    display: {
      name: 'Space Grotesk',
      value: "'Space Grotesk', -apple-system, system-ui, sans-serif",
      usage: 'Marketing headlines, hero sections'
    },
    marketing: {
      name: 'Space Grotesk',
      value: "'Space Grotesk', -apple-system, system-ui, sans-serif",
      usage: 'Marketing body copy, landing pages'
    },
    serif: {
      name: 'System Serif',
      value: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
      usage: 'Editorial, long-form content'
    }
  },
  googleFontsImport: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
};

// Custom Color Palettes
export const customColors = {
  'groq-orange': {
    name: 'Groq Orange',
    palette: {
      50: '#fff5e5',
      100: '#ffe8cc',
      200: '#ffd1a3',
      300: '#ffb973',
      400: '#fe9e20',
      500: '#f48b0a',
      600: '#f43e01',
      700: '#c23101',
      800: '#9a2701',
      900: '#731d00',
      950: '#5a1500',
    }
  },
  'groq-gray': {
    name: 'Groq Gray',
    palette: {
      50: '#fefefe',
      100: '#fafafa',
      200: '#f3f3ee',
      300: '#edede5',
      400: '#e8e8de',
      500: '#cecebf',
      600: '#766f6b',
      700: '#655852',
      800: '#2d2f33',
      900: '#272b2c',
      950: '#1e1e1e',
    }
  },
  'groq-yellow': {
    name: 'Groq Yellow',
    palette: {
      50: '#fffef0',
      100: '#fefcd0',
      200: '#f4fd90',
      300: '#fdeb20',
      400: '#e6d000',
      500: '#c6b802',
      600: '#a89c02',
      700: '#8a8002',
      800: '#6c6401',
      900: '#4e4801',
      950: '#302c00',
    }
  },
  'groq-green': {
    name: 'Groq Green',
    palette: {
      50: '#e8fff4',
      100: '#c5ffe3',
      200: '#a9ffdb',
      300: '#10e68d',
      400: '#0dcc7a',
      500: '#0ab368',
      600: '#089a56',
      700: '#018b01',
      800: '#016801',
      900: '#014501',
      950: '#002200',
    }
  },
  'groq-blue': {
    name: 'Groq Blue',
    palette: {
      50: '#e8f7ff',
      100: '#d0eeff',
      200: '#bfe4fc',
      300: '#5fc0ff',
      400: '#3aacf0',
      500: '#0082a0',
      600: '#006d87',
      700: '#00586e',
      800: '#004355',
      900: '#002e3c',
      950: '#001923',
    }
  },
  'groq-purple': {
    name: 'Groq Purple',
    palette: {
      50: '#faf5ff',
      100: '#f0e5ff',
      200: '#e3dcf8',
      300: '#d377fd',
      400: '#b85ce8',
      500: '#9d41d3',
      600: '#8230b8',
      700: '#683d7f',
      800: '#522f66',
      900: '#3c214d',
      950: '#261334',
    }
  },
  'groq-pink': {
    name: 'Groq Pink',
    palette: {
      50: '#fff5fc',
      100: '#ffe5f7',
      200: '#fad8ff',
      300: '#f392dd',
      400: '#ee66ce',
      500: '#e040b8',
      600: '#c230a0',
      700: '#a42088',
      800: '#861070',
      900: '#680058',
      950: '#4a0040',
    }
  }
};

// Semantic Colors (buttons, alerts, etc.)
export const semanticColors = {
  primary: {
    name: 'Primary',
    base: '#f43e01',    // groq-orange-600
    hover: '#c23101',   // groq-orange-700
    active: '#9a2701',  // groq-orange-800
    text: '#ffffff'
  },
  secondary: {
    name: 'Secondary',
    base: '#f3f3ee',    // groq-gray-100
    hover: '#e5e5dc',   // groq-gray-200
    active: '#cecebf',  // groq-gray-300
    text: '#26292e',    // groq-gray-800
    border: '#cecebf'   // groq-gray-300
  },
  tertiary: {
    name: 'Tertiary',
    base: 'transparent',
    hover: '#f3f3ee',   // groq-gray-100
    active: '#e5e5dc',  // groq-gray-200
    text: '#69695d',    // groq-gray-500
    border: '#cecebf'   // groq-gray-300
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
    // Will be populated dynamically from customColors
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

