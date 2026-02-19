/**
 * Gemini Image Generation Script
 *
 * Generates workout exercise images using Google Gemini API (gemini-3-pro-image-preview)
 * Always uses a reference image for consistent minimalist style.
 *
 * Usage:
 *   deno run -A generate.ts --reference <image> --output <path> --prompt <text>
 *
 * Environment:
 *   GEMINI_API_KEY - Your Google Gemini API key
 */

import { parse } from "https://deno.land/std@0.208.0/flags/mod.ts";
import { basename, dirname, join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";

// Load .env file if present
async function loadEnv() {
  // Try multiple possible locations for .env
  const possiblePaths = [
    // When running from apps/wod directory
    "./.env",
    // Absolute path based on script location
    new URL("../../.env", import.meta.url).pathname,
    // Fallback absolute path
    "/Users/janzheng/conductor/workspaces/design/warsaw/apps/wod/.env",
  ];

  for (const envPath of possiblePaths) {
    try {
      const envText = await Deno.readTextFile(envPath);
      for (const line of envText.split("\n")) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith("#")) continue;
        const eqIndex = trimmedLine.indexOf("=");
        if (eqIndex > 0) {
          const key = trimmedLine.slice(0, eqIndex).trim();
          const value = trimmedLine.slice(eqIndex + 1).trim();
          if (key && value) {
            Deno.env.set(key, value);
          }
        }
      }
      return; // Successfully loaded
    } catch {
      // Try next path
    }
  }
}
await loadEnv();

const DEFAULT_STYLE = `Minimalist fitness illustration with flat, solid colors (cel-shaded style):

Color palette - use FLAT SOLID FILLS, no gradients or texture:
- Skin: single flat peachy-beige (#F7DCC9) - ONE solid color, NO blotches, NO gradients, NO shading
- Hair: flat muted auburn (#C97B62) with simple highlight streaks (#D4896F)
- Clothes: flat dusty coral (#E9A090) sports bra and shorts - ONE solid color per garment
- Outlines: soft terracotta lines (#D49080) - thin and delicate

CRITICAL style requirements:
- FLAT COLORS ONLY - skin must be one uniform solid color with no variation
- NO gradients, NO shading, NO blotchy textures on skin or clothes
- Clean cel-shaded/vector illustration style
- COMPLETELY FACELESS - head is just a blank oval shape filled with skin color
- NO facial features at all: NO eyes, NO nose, NO mouth, NO lips, NO eyebrows
- Face area is just smooth flat skin color with no detail whatsoever
- Hands with defined fingers (not blob hands)
- Hair with simple strand lines
- Clothes with simple fold lines (not color variation)
- Thin, elegant line work throughout
- Pure white background ONLY - NO floor line, NO ground line, NO shadows
- Figure floats in empty white space

Do NOT include: text, labels, watermarks, ground lines, skin texture, color gradients, shading, or ANY facial features.`;

// Available image models: gemini-2.0-flash-exp-image-generation, gemini-2.5-flash-image, gemini-3-pro-image-preview
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent";

interface GenerateOptions {
  reference?: string;  // Optional - text-only generation if not provided
  output: string;
  prompt: string;
  style?: string;
}

async function loadImageAsBase64(path: string): Promise<{ data: string; mimeType: string }> {
  const data = await Deno.readFile(path);
  const base64 = btoa(String.fromCharCode(...data));

  const ext = path.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
  };

  return {
    data: base64,
    mimeType: mimeTypes[ext || "png"] || "image/png",
  };
}

async function generateImage(options: GenerateOptions): Promise<void> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY not configured");
    console.error("Create apps/wod/.env with: GEMINI_API_KEY=your_key_here");
    Deno.exit(1);
  }

  // Log model being used
  const modelName = API_URL.split("/models/")[1]?.split(":")[0] || "unknown";
  console.log(`Using model: ${modelName}`);

  const stylePrompt = options.style || DEFAULT_STYLE;
  const fullPrompt = `${stylePrompt}\n\nExercise to illustrate: ${options.prompt}`;

  console.log(`\n--- FULL PROMPT BEING SENT ---`);
  console.log(fullPrompt);
  console.log(`--- END PROMPT ---\n`);

  // Build request - reference image is optional
  const parts: any[] = [{ text: fullPrompt }];

  if (options.reference) {
    console.log(`Loading reference image: ${options.reference}`);
    const refImage = await loadImageAsBase64(options.reference);
    parts.push({
      inline_data: {
        mime_type: refImage.mimeType,
        data: refImage.data,
      },
    });
  } else {
    console.log(`No reference image - using text-only generation`);
  }

  const requestBody = {
    contents: [{
      parts,
    }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  const response = await fetch(`${API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}): ${errorText}`);
    Deno.exit(1);
  }

  const result = await response.json();

  // Extract image from response
  const candidates = result.candidates || [];
  if (candidates.length === 0) {
    console.error("No candidates in response");
    Deno.exit(1);
  }

  const responseParts = candidates[0].content?.parts || [];
  // API returns inlineData (camelCase) not inline_data (snake_case)
  const imagePart = responseParts.find((p: any) =>
    (p.inline_data?.mime_type?.startsWith("image/")) ||
    (p.inlineData?.mimeType?.startsWith("image/"))
  );

  if (!imagePart) {
    console.error("No image in response");
    console.error("Response parts:", responseParts.map((p: any) => Object.keys(p)));

    // Check if there's text feedback
    const textPart = responseParts.find((p: any) => p.text);
    if (textPart) {
      console.log("Model response:", textPart.text);
    }
    Deno.exit(1);
  }

  // Handle both camelCase (inlineData) and snake_case (inline_data) responses
  const imageData = imagePart.inlineData?.data || imagePart.inline_data?.data;
  const binaryData = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));

  // Ensure output directory exists
  await ensureDir(dirname(options.output));

  await Deno.writeFile(options.output, binaryData);
  console.log(`Image saved to: ${options.output}`);

  return options.output;
}

// Convert PNG to JPG using sips (macOS) with quality/size options
async function convertToJpg(pngPath: string, quality = 80): Promise<string> {
  const jpgPath = pngPath.replace(/\.png$/i, ".jpg");

  // Use sips (built into macOS) to convert and compress
  const cmd = new Deno.Command("sips", {
    args: [
      "-s", "format", "jpeg",
      "-s", "formatOptions", String(quality),
      pngPath,
      "--out", jpgPath,
    ],
  });

  const result = await cmd.output();

  if (!result.success) {
    const errorText = new TextDecoder().decode(result.stderr);
    console.error(`Failed to convert to JPG: ${errorText}`);
    return pngPath; // Return original on failure
  }

  // Get file sizes for comparison
  const pngStat = await Deno.stat(pngPath);
  const jpgStat = await Deno.stat(jpgPath);
  const pngKb = Math.round(pngStat.size / 1024);
  const jpgKb = Math.round(jpgStat.size / 1024);
  const savings = Math.round((1 - jpgStat.size / pngStat.size) * 100);

  console.log(`Converted to JPG: ${jpgPath}`);
  console.log(`  PNG: ${pngKb}KB → JPG: ${jpgKb}KB (${savings}% smaller)`);

  // Remove the PNG file
  await Deno.remove(pngPath);
  console.log(`  Removed: ${pngPath}`);

  return jpgPath;
}

// Load exercise JSON and build detailed prompt from all relevant fields
async function loadExercise(exerciseId: string): Promise<{ name: string; description: string; imagePrompt?: string; imagePath?: string }> {
  const exercisePath = `exercises/${exerciseId}.json`;
  try {
    const text = await Deno.readTextFile(exercisePath);
    const exercise = JSON.parse(text);
    const imagePath = exercise.media?.find((m: any) => m.type === "image")?.value?.replace(/^\//, "static/");

    // Clean description: remove day references like "(Day 25)" that would appear as text
    const cleanDescription = exercise.description
      .replace(/\s*\(Day\s*\d+\)/gi, "")
      .replace(/\s*Day\s*\d+/gi, "")
      .trim();

    // Build a detailed prompt with all context to help the model understand the exercise
    const parts = [
      `Exercise: ${exercise.name}`,
      `Type: ${exercise.type}`,
      exercise.muscles?.length ? `Target muscles: ${exercise.muscles.join(", ")}` : "",
      exercise.tags?.length ? `Position/style: ${exercise.tags.join(", ")}` : "",
      `Description: ${cleanDescription}`,
    ].filter(Boolean);

    return {
      name: exercise.name,
      description: parts.join("\n"),
      imagePrompt: exercise.imagePrompt, // Custom prompt if provided
      imagePath,
    };
  } catch {
    console.error(`Error: Could not load exercise '${exerciseId}'`);
    console.error(`Expected file: ${exercisePath}`);
    Deno.exit(1);
  }
}

// CLI
const args = parse(Deno.args, {
  string: ["reference", "output", "prompt", "style", "exercise", "quality"],
  boolean: ["no-ref", "jpg"],
  alias: {
    r: "reference",
    o: "output",
    p: "prompt",
    s: "style",
    e: "exercise",
    j: "jpg",
    q: "quality",
  },
});

// If exercise ID provided, load it and use its data
let prompt = args.prompt;
let reference = args.reference;
let output = args.output;

if (args.exercise) {
  const exercise = await loadExercise(args.exercise);

  // Use imagePrompt if available (custom prompt for better image generation)
  // Otherwise fall back to auto-generated description
  if (exercise.imagePrompt) {
    prompt = exercise.imagePrompt;
    console.log(`Loaded exercise: ${exercise.name} (using custom imagePrompt)`);
  } else {
    prompt = `${exercise.name}: ${exercise.description}`;
    console.log(`Loaded exercise: ${exercise.name} (using auto-generated prompt)`);
  }

  // Use exercise image as reference if not specified AND --no-ref not set
  if (!reference && exercise.imagePath && !args["no-ref"]) {
    reference = exercise.imagePath;
  }

  // Default output path if not specified
  if (!output) {
    output = `static/new-images/${args.exercise}.png`;
  }
}

if (!output || !prompt) {
  console.log(`
Gemini Image Generation for WOD

Usage:
  deno run -A generate.ts --exercise <id> [--output <path>] [--no-ref] [--jpg]
  deno run -A generate.ts --output <path> --prompt <text> [--reference <image>] [--jpg]

Options:
  -e, --exercise   Exercise ID (loads name/description from exercises/*.json)
  -r, --reference  Reference image path (optional - omit for text-only generation)
  -o, --output     Output image path (defaults to static/new-images/<exercise-id>.png)
  -p, --prompt     Exercise description prompt (auto-loaded from exercise if using -e)
  -s, --style      Custom style prompt (optional, uses default WOD style)
  -j, --jpg        Convert output to JPG (smaller file size, removes PNG)
  -q, --quality    JPG quality 1-100 (default: 80)
  --no-ref         Skip reference image even if exercise has one (text-only generation)

Examples:
  # Generate from exercise JSON (text-only, as JPG)
  deno run -A generate.ts --exercise barre-bent-leg-side-lift --no-ref --jpg

  # Generate with custom quality
  deno run -A generate.ts --exercise bird-dog --no-ref --jpg --quality 60

  # Generate with custom prompt (text-only)
  deno run -A generate.ts \\
    --output static/new-images/fire-hydrant.png \\
    --prompt "Fire Hydrant: On all fours, lift bent knee out to the side at hip level" \\
    --jpg
`);
  Deno.exit(1);
}

const pngPath = await generateImage({
  reference,
  output,
  prompt,
  style: args.style,
});

// Convert to JPG if requested
if (args.jpg && pngPath) {
  const quality = args.quality ? parseInt(args.quality, 10) : 80;
  await convertToJpg(pngPath, quality);
}
