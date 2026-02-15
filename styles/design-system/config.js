// Design theme configuration
// ============================================================
// THEME SWITCHING: Comment/uncomment the import below to switch themes
// This should match the theme selected in theme.scss
// ============================================================

// DEFAULT THEME (uncomment this, comment out others)
// import * as activeTheme from './themes/default/config.js';

// GROQ THEME (uncomment this, comment out others)
import * as activeTheme from './themes/groq/config.js';

// RETRO THEME (create retro/config.js first)
// import * as activeTheme from './themes/retro/config.js';

// STARTUP THEME (create startup/config.js first)
// import * as activeTheme from './themes/startup/config.js';

// LUMA THEME (create luma/config.js first)
// import * as activeTheme from './themes/luma/config.js';

// ============================================================
// Re-export theme data for direct access
// ============================================================
export const themeName = activeTheme.themeName;
export const themeDescription = activeTheme.themeDescription;
export const typography = activeTheme.typography;
export const customColors = activeTheme.customColors;
export const semanticColors = activeTheme.semanticColors;
export const tailwindExtend = activeTheme.tailwindExtend;
export const themeConfig = activeTheme.themeConfig;

// ============================================================
// Generate Tailwind config script tag from theme data
// ============================================================
function generateTailwindScript() {
  // Build the color palette entries for Tailwind
  const colorEntries = Object.entries(customColors).map(([key, value]) => {
    return "          '" + key + "': window.themeConfig.customColors['" + key + "'].palette";
  }).join(',\n');

  // Build the themeConfig object as a string
  const themeConfigStr = JSON.stringify({
    typography: typography,
    customColors: customColors,
    semanticColors: semanticColors
  }, null, 2);

  // Build the complete script
  const script = '<script src="https://cdn.tailwindcss.com"></script>\n<script>\n' +
    '  // Theme: ' + themeName + '\n' +
    '  // ' + themeDescription + '\n' +
    '  window.themeConfig = ' + themeConfigStr + ';\n\n' +
    '  tailwind.config = {\n' +
    '    theme: {\n' +
    '      extend: {\n' +
    '        fontFamily: {\n' +
    '          \'sans\': \'var(--font-sans)\',\n' +
    '          \'mono\': \'var(--font-mono)\',\n' +
    '          \'serif\': \'var(--font-serif)\',\n' +
    '          \'display\': \'var(--font-display)\',\n' +
    '          \'marketing\': \'var(--font-marketing)\',\n' +
    '        },\n' +
    '        colors: {\n' +
    colorEntries + ',\n' +
    '          \'primary\': window.themeConfig.semanticColors.primary.base,\n' +
    '          \'secondary\': window.themeConfig.semanticColors.secondary.base,\n' +
    '          \'tertiary\': window.themeConfig.semanticColors.tertiary.base,\n' +
    '          \'accent\': \'var(--color-accent)\',\n' +
    '          \'success\': \'var(--color-success)\',\n' +
    '          \'warning\': \'var(--color-warning)\',\n' +
    '          \'danger\': \'var(--color-danger)\',\n' +
    '          \'info\': \'var(--color-info)\',\n' +
    '        }\n' +
    '      }\n' +
    '    }\n' +
    '  }\n' +
    '</script>';

  return script;
}

// Export the generated tailwind styles
export const tailwindStyles = generateTailwindScript();

// Load the compiled theme CSS
export async function getStyles() {
  const baseUrl = new URL('.', import.meta.url);
  const cssUrl = new URL('./theme.css', baseUrl);
  const cssPath = cssUrl.protocol === 'file:' ? cssUrl.pathname : cssUrl.href;
  
  const baseCss = await Deno.readTextFile(cssPath);
  
  return {
    tailwind: tailwindStyles,
    baseCss: baseCss
  };
}
