/**
 * Build script to bundle all exercises into a single JSON file for browser use.
 *
 * Usage: deno run -A scripts/build-exercises.ts
 */

import { walk } from "@std/fs";

const EXERCISES_PATH = new URL("../exercises", import.meta.url).pathname;
const OUTPUT_PATH = new URL("../static/exercises.json", import.meta.url).pathname;

interface Exercise {
  id: string;
  name: string;
  type: string;
  muscles: string[];
  equipment: string[];
  tags: string[];
  difficulty?: string;
  description?: string;
  challenge?: {
    id: string;
    name: string;
    creator?: string;
    day: number;
  };
  media?: Array<{
    type: string;
    value: string;
    caption?: string;
  }>;
}

async function buildExercises(): Promise<void> {
  console.log("🏋️ Building exercises catalogue...\n");

  const exercises: Exercise[] = [];
  let count = 0;
  let errors = 0;

  for await (const entry of walk(EXERCISES_PATH, {
    exts: [".json"],
    includeDirs: false,
  })) {
    try {
      const content = await Deno.readTextFile(entry.path);
      const data = JSON.parse(content) as Exercise;

      // Basic validation
      if (!data.id || !data.name) {
        console.warn(`  ⚠️ Skipping ${entry.name}: missing id or name`);
        errors++;
        continue;
      }

      exercises.push(data);
      count++;
    } catch (e) {
      console.warn(`  ⚠️ Error parsing ${entry.name}:`, e);
      errors++;
    }
  }

  // Sort by id for consistent output
  exercises.sort((a, b) => a.id.localeCompare(b.id));

  // Write output
  await Deno.writeTextFile(OUTPUT_PATH, JSON.stringify(exercises, null, 2));

  const stats = {
    total: count,
    errors,
    types: [...new Set(exercises.map(e => e.type))],
    challenges: [...new Set(exercises.filter(e => e.challenge).map(e => e.challenge!.id))],
  };

  console.log(`✅ Built ${count} exercises → static/exercises.json`);
  console.log(`   Types: ${stats.types.join(", ")}`);
  console.log(`   Challenges: ${stats.challenges.length > 0 ? stats.challenges.join(", ") : "none"}`);
  if (errors > 0) {
    console.log(`   ⚠️ ${errors} files skipped due to errors`);
  }

  // Also output a summary
  const sizeKb = (await Deno.stat(OUTPUT_PATH)).size / 1024;
  console.log(`   Size: ${sizeKb.toFixed(1)} KB`);
}

buildExercises().catch(console.error);
