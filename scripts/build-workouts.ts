/**
 * Build script to bundle all workouts into a single JSON file for browser use.
 *
 * Usage: deno run -A scripts/build-workouts.ts
 */

import { walk } from "@std/fs";

const WORKOUTS_PATH = new URL("../workouts", import.meta.url).pathname;
const OUTPUT_PATH = new URL("../static/workouts.json", import.meta.url).pathname;

interface Workout {
  id: string;
  name: string;
  description?: string;
  routineId?: string;
  category?: string;
  tags?: string[];
  estimatedDuration?: number;
  equipment?: string[];
  sets?: unknown[];
  tips?: string[];
  [key: string]: unknown;
}

async function buildWorkouts(): Promise<void> {
  console.log("🏋️ Building workouts catalogue...\n");

  const workouts: Workout[] = [];
  let count = 0;
  let errors = 0;

  for await (const entry of walk(WORKOUTS_PATH, {
    exts: [".json"],
    includeDirs: false,
  })) {
    try {
      const content = await Deno.readTextFile(entry.path);
      const data = JSON.parse(content) as Workout;

      // Basic validation
      if (!data.id || !data.name) {
        console.warn(`  ⚠️ Skipping ${entry.name}: missing id or name`);
        errors++;
        continue;
      }

      // Add category based on directory structure
      const relativePath = entry.path.replace(WORKOUTS_PATH + "/", "");
      const pathParts = relativePath.split("/");
      if (pathParts.length > 1) {
        data.category = pathParts[0]; // e.g., "gym", "barre", "cardio"
      }

      workouts.push(data);
      count++;
    } catch (e) {
      console.warn(`  ⚠️ Error parsing ${entry.name}:`, e);
      errors++;
    }
  }

  // Sort by category then id for consistent output
  workouts.sort((a, b) => {
    const catCompare = (a.category || "").localeCompare(b.category || "");
    if (catCompare !== 0) return catCompare;
    return a.id.localeCompare(b.id);
  });

  // Write output
  await Deno.writeTextFile(OUTPUT_PATH, JSON.stringify(workouts, null, 2));

  const stats = {
    total: count,
    errors,
    categories: [...new Set(workouts.map(w => w.category).filter(Boolean))],
  };

  console.log(`✅ Built ${count} workouts → static/workouts.json`);
  console.log(`   Categories: ${stats.categories.join(", ")}`);
  if (errors > 0) {
    console.log(`   ⚠️ ${errors} files skipped due to errors`);
  }

  // Also output a summary
  const sizeKb = (await Deno.stat(OUTPUT_PATH)).size / 1024;
  console.log(`   Size: ${sizeKb.toFixed(1)} KB`);
}

buildWorkouts().catch(console.error);
