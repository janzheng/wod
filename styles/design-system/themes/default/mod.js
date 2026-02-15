// Default theme module
// Clean Shadcn-style with custom Brand Blue color family
export const tailwindStyles = `<script src="https://cdn.tailwindcss.com"></script>
<script>
  // Expose custom color config to Alpine
  window.themeConfig = {
    customColors: {
      brand: {
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
    },
    semanticColors: {
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
    }
  };

  tailwind.config = {
    theme: {
      extend: {
        colors: {
          brand: window.themeConfig.customColors.brand.palette,
          primary: window.themeConfig.semanticColors.primary.base,
          secondary: window.themeConfig.semanticColors.secondary.base,
          tertiary: window.themeConfig.semanticColors.tertiary.base
        }
      }
    }
  }
</script>`;

// Load base.css
export async function getStyles() {
  const baseUrl = new URL('.', import.meta.url);
  const cssUrl = new URL('./base.css', baseUrl);
  const cssPath = cssUrl.protocol === 'file:' ? cssUrl.pathname : cssUrl.href;
  const baseCss = await Deno.readTextFile(cssPath);
  
  return {
    tailwind: tailwindStyles,
    baseCss: baseCss
  };
}
