/**
 * Data Loader — walks data directories, parses JSON, validates with Zod.
 * Adapted for tallinn's nested workout directory structure.
 */

import {
  exerciseSchema,
  workoutSchema,
  routineSchema,
  progressionSchema,
  type Exercise,
  type Workout,
  type Routine,
  type Progression,
  type LoadedData,
} from "../types.ts";

// deno-lint-ignore no-explicit-any
async function loadJsonDir<T>(
  dir: string,
  schema: { safeParse: (data: unknown) => any },
  verbose = false,
): Promise<Map<string, T>> {
  const map = new Map<string, T>();
  for await (const entry of Deno.readDir(dir)) {
    if (!entry.isFile || !entry.name.endsWith(".json")) continue;
    try {
      const raw = await Deno.readTextFile(`${dir}/${entry.name}`);
      const data = JSON.parse(raw);
      const result = schema.safeParse(data);
      if (result.success) {
        const id = (result.data as { id: string }).id;
        map.set(id, result.data);
      } else if (verbose) {
        console.warn(`[loader] Skipped ${entry.name}: ${result.error.issues[0]?.message}`);
      }
    } catch (err) {
      if (verbose) console.warn(`[loader] Error reading ${entry.name}: ${err}`);
    }
  }
  return map;
}

/**
 * Recursively load JSON files from a directory and its subdirectories.
 * Used for tallinn's nested workout structure (workouts/gym/*.json, etc.)
 */
// deno-lint-ignore no-explicit-any
async function loadJsonDirRecursive<T>(
  dir: string,
  schema: { safeParse: (data: unknown) => any },
  verbose = false,
): Promise<Map<string, T>> {
  const map = new Map<string, T>();

  async function walk(currentDir: string) {
    for await (const entry of Deno.readDir(currentDir)) {
      if (entry.isDirectory) {
        await walk(`${currentDir}/${entry.name}`);
      } else if (entry.isFile && entry.name.endsWith(".json")) {
        try {
          const raw = await Deno.readTextFile(`${currentDir}/${entry.name}`);
          const data = JSON.parse(raw);
          const result = schema.safeParse(data);
          if (result.success) {
            const id = (result.data as { id: string }).id;
            map.set(id, result.data);
          } else if (verbose) {
            console.warn(`[loader] Skipped ${entry.name}: ${result.error.issues[0]?.message}`);
          }
        } catch (err) {
          if (verbose) console.warn(`[loader] Error reading ${entry.name}: ${err}`);
        }
      }
    }
  }

  await walk(dir);
  return map;
}

export async function loadData(dataDir: string, verbose = false): Promise<LoadedData> {
  const [exercises, workouts, routines, progressions] = await Promise.all([
    loadJsonDir<Exercise>(`${dataDir}/exercises`, exerciseSchema, verbose),
    loadJsonDirRecursive<Workout>(`${dataDir}/workouts`, workoutSchema, verbose),
    loadJsonDir<Routine>(`${dataDir}/routines`, routineSchema, verbose),
    loadJsonDir<Progression>(`${dataDir}/progressions`, progressionSchema, verbose),
  ]);

  return { exercises, workouts, routines, progressions };
}
