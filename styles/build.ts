// Build script for routine-stack styles
// Creates compiled CSS from design system + Tailwind + app styles
import * as sass from "npm:sass";
import postcss from "npm:postcss";
import tailwindcss from "npm:tailwindcss";
import autoprefixer from "npm:autoprefixer";
import { copy } from "jsr:@std/fs/copy";

// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
  // Source paths
  DESIGN_SYSTEM_SOURCE: "../../../design-engine/packages/styles",
  DESIGN_SYSTEM_DEST: "./design-system",
  APP_STYLES_SCSS: "./app.scss",
  TAILWIND_CSS: "./tailwind.css",

  // Output settings
  OUTPUT_FILE: "../styles.css",

  // App identifier
  APP_NAME: "routine-stack",
};
// ========================================

async function buildStyles() {
  console.log(`\n🔄 Building ${CONFIG.APP_NAME} styles...\n`);

  // Step 1: Copy the design system
  console.log("📁 Step 1: Copying design system...");
  try {
    try {
      await Deno.remove(CONFIG.DESIGN_SYSTEM_DEST, { recursive: true });
    } catch {
      // Folder doesn't exist, that's fine
    }

    await copy(CONFIG.DESIGN_SYSTEM_SOURCE, CONFIG.DESIGN_SYSTEM_DEST, { overwrite: true });
    console.log(`   ✅ Copied design system → ${CONFIG.DESIGN_SYSTEM_DEST}`);
  } catch (error) {
    console.error(`   ❌ Error copying design system:`, error);
    Deno.exit(1);
  }

  // Step 2: Compile design system
  console.log("\n📦 Step 2: Compiling design system...");
  let designSystemCss = "";
  try {
    const themeScssPath = `${CONFIG.DESIGN_SYSTEM_DEST}/theme.scss`;
    const scssContent = await Deno.readTextFile(themeScssPath);

    const result = sass.compileString(scssContent, {
      style: "compressed",
      loadPaths: [CONFIG.DESIGN_SYSTEM_DEST],
    });

    designSystemCss = result.css;
    console.log(`   ✅ Compiled design system (compressed)`);
  } catch (error) {
    console.error(`   ❌ Error compiling design system:`, error);
    Deno.exit(1);
  }

  // Step 3: Build Tailwind utilities
  console.log("\n🎨 Step 3: Building Tailwind utilities...");
  let tailwindCss = "";
  try {
    const tailwindContent = await Deno.readTextFile(CONFIG.TAILWIND_CSS);

    const postcssResult = await postcss([
      tailwindcss("./tailwind.config.js"),
      autoprefixer,
    ]).process(tailwindContent, {
      from: CONFIG.TAILWIND_CSS,
      to: CONFIG.OUTPUT_FILE
    });

    tailwindCss = postcssResult.css;
    console.log(`   ✅ Generated Tailwind utilities`);
  } catch (error) {
    console.error(`   ❌ Error building Tailwind:`, error);
    Deno.exit(1);
  }

  // Step 4: Compile app-specific SCSS styles
  console.log("\n🎨 Step 4: Compiling app SCSS styles...");
  let appCss = "";
  try {
    const sassResult = sass.compile(CONFIG.APP_STYLES_SCSS, {
      style: "compressed",
    });

    appCss = sassResult.css;
    console.log(`   ✅ Compiled ${CONFIG.APP_STYLES_SCSS}`);
  } catch (error) {
    console.error(`   ❌ Error compiling app styles:`, error);
    Deno.exit(1);
  }

  // Step 5: Combine and write output
  console.log("\n📝 Step 5: Writing combined CSS...");
  try {
    const combinedCss = `/* ${CONFIG.APP_NAME} - Generated CSS */\n${designSystemCss}\n${tailwindCss}\n${appCss}`;
    await Deno.writeTextFile(CONFIG.OUTPUT_FILE, combinedCss);
    const totalSize = new TextEncoder().encode(combinedCss).length;
    console.log(`   ✅ Created ${CONFIG.OUTPUT_FILE} (${(totalSize / 1024).toFixed(2)} KB)`);
  } catch (error) {
    console.error(`   ❌ Error writing CSS:`, error);
    Deno.exit(1);
  }

  console.log("\n" + "=".repeat(50));
  console.log("📦 Build complete!");
  console.log("=".repeat(50) + "\n");
}

if (import.meta.main) {
  await buildStyles();
}
