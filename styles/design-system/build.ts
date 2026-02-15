// Build script to compile SCSS to CSS with Tailwind support
// Supports chunking for deployment targets with file size limits (e.g., Val Town < 100KB)
import * as sass from "npm:sass@^1.69.0";
import postcss from "npm:postcss@^8.4.31";
import tailwindcss from "npm:tailwindcss@^3.3.5";
import autoprefixer from "npm:autoprefixer@^10.4.16";

// Configuration
const MAX_CHUNK_SIZE = 60 * 1024; // 60KB per chunk (for Val Town compatibility)
const ENABLE_CHUNKING = false;   // Set to true if deploying to Val Town or similar

// Remove empty CSS rule blocks that only contain comments.
// These get generated when SCSS files have section comments like:
// .theme-scope { /* Tables */ }
function removeEmptyRules(css: string): string {
  // Pattern matches selectors followed by { optional whitespace/comments only }
  // This handles blocks that are empty or only contain CSS comments
  const emptyRulePattern = /[^{}]+\{\s*(\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/\s*)*\}/g;
  
  let result = css;
  let previousResult = "";
  
  // Keep removing until no more changes (handles nested empty blocks)
  while (result !== previousResult) {
    previousResult = result;
    result = result.replace(emptyRulePattern, (match) => {
      // Extract just the content between braces
      const braceStart = match.indexOf("{");
      const content = match.slice(braceStart + 1, -1).trim();
      
      // Check if content is empty or only contains comments
      const withoutComments = content.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "").trim();
      
      if (withoutComments === "") {
        return ""; // Remove the entire empty rule
      }
      return match; // Keep non-empty rules
    });
  }
  
  // Clean up extra blank lines left behind
  result = result.replace(/\n{3,}/g, "\n\n");
  
  return result;
}

// Split CSS into chunks at rule boundaries (doesn't break in middle of a rule)
function splitCssIntoChunks(css: string, maxSize: number): string[] {
  const chunks: string[] = [];
  let currentChunk = "";
  
  // Split by top-level rules (at rule boundaries)
  const rules = css.split(/(?<=\})\s*(?=[.@#a-zA-Z])/);
  
  for (const rule of rules) {
    const testChunk = currentChunk + rule;
    const testSize = new TextEncoder().encode(testChunk).length;
    
    if (testSize > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = rule;
    } else {
      currentChunk = testChunk;
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// Write CSS with optional chunking
async function writeCssWithChunking(
  css: string, 
  outputPath: string, 
  enableChunking: boolean,
  maxChunkSize: number
): Promise<string[]> {
  const totalSize = new TextEncoder().encode(css).length;
  const outputFiles: string[] = [];
  
  if (!enableChunking || totalSize <= maxChunkSize) {
    // Write single file
    await Deno.writeTextFile(outputPath, css);
    console.log(`   ✅ Created ${outputPath} (${(totalSize / 1024).toFixed(2)} KB)`);
    outputFiles.push(outputPath);
  } else {
    // Split into chunks
    const chunks = splitCssIntoChunks(css, maxChunkSize);
    const basePath = outputPath.replace('.css', '');
    
    for (let i = 0; i < chunks.length; i++) {
      const chunkFile = `${basePath}-${i + 1}.css`;
      await Deno.writeTextFile(chunkFile, chunks[i]);
      const chunkSize = new TextEncoder().encode(chunks[i]).length;
      console.log(`   ✅ Created ${chunkFile} (${(chunkSize / 1024).toFixed(2)} KB)`);
      outputFiles.push(chunkFile);
    }
    
    // Create loader instructions
    const loaderContent = `/* CSS Chunks - Include these in order in your HTML:
${outputFiles.map(f => `   <link rel="stylesheet" href="/${f.split('/').pop()}">`).join('\n')}

Or stitch together at runtime in your server (recommended).
*/
`;
    const loaderPath = `${basePath}-loader.txt`;
    await Deno.writeTextFile(loaderPath, loaderContent);
    console.log(`   ✅ Created ${loaderPath} (instructions)`);
    console.log(`\n   Total: ${(totalSize / 1024).toFixed(2)} KB in ${chunks.length} chunks`);
  }
  
  return outputFiles;
}

async function buildStyles() {
  const stylesDir = ".";

  // Build the main theme.scss (the single entry point)
  const themeScssPath = `${stylesDir}/theme.scss`;
  const themeCssPath = `${stylesDir}/theme.css`;
  
  try {
    const scssContent = await Deno.readTextFile(themeScssPath);
    
    const result = sass.compileString(scssContent, {
      style: ENABLE_CHUNKING ? "compressed" : "expanded",
      loadPaths: [stylesDir],
    });
    
    const cleanedCss = removeEmptyRules(result.css);
    await writeCssWithChunking(cleanedCss, themeCssPath, ENABLE_CHUNKING, MAX_CHUNK_SIZE);
  } catch (error) {
    console.error(`❌ Error compiling theme.scss:`, error.message);
  }
  
  // Build app-specific SCSS files
  await buildAppStyles();
}

async function buildAppStyles() {
  const appsDir = "../../playground/templates";
  
  try {
    // Find all styles.scss files in app directories
    for await (const entry of Deno.readDir(appsDir)) {
      if (entry.isDirectory) {
        const scssPath = `${appsDir}/${entry.name}/styles.scss`;
        const cssPath = `${appsDir}/${entry.name}/styles.css`;
        
        try {
          // Check if styles.scss exists
          await Deno.stat(scssPath);
          
          // Step 1: Compile SCSS to CSS
          const sassResult = sass.compile(scssPath, {
            style: "expanded",
          });
          
          // Step 2: Process through Tailwind/PostCSS for @apply support
          const postcssResult = await postcss([
            tailwindcss("./tailwind.config.js"),
            autoprefixer,
          ]).process(sassResult.css, { 
            from: scssPath, 
            to: cssPath 
          });
          
          await Deno.writeTextFile(cssPath, postcssResult.css);
          console.log(`✅ Compiled ${scssPath} → ${cssPath} (with Tailwind)`);
        } catch (e) {
          // Check if it's just a missing file or an actual error
          if (e instanceof Deno.errors.NotFound) {
            // No styles.scss in this app, skip silently
          } else {
            console.error(`❌ Error compiling ${scssPath}:`, e.message);
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error compiling app styles:`, error.message);
  }
}

// Build Tailwind CSS with @apply support
async function buildTailwind() {
  const inputPath = "./tailwind.css";
  const outputPath = "./tailwind-compiled.css";
  
  try {
    const css = await Deno.readTextFile(inputPath);
    
    const result = await postcss([
      tailwindcss("./tailwind.config.js"),
      autoprefixer,
    ]).process(css, { 
      from: inputPath, 
      to: outputPath 
    });
    
    await Deno.writeTextFile(outputPath, result.css);
    console.log(`✅ Compiled ${inputPath} → ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error compiling Tailwind:`, error.message);
  }
}

// Run build
if (import.meta.main) {
  await buildStyles();
  await buildTailwind();
}
