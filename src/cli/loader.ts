import { walk } from "@std/fs";
import {
  workoutSchema,
  routineSchema,
  progressionSchema,
  type Workout,
  type Routine,
  type Progression,
} from "../schemas-v2.ts";
import { exerciseSchema, type Exercise } from "../schemas.ts";

const BASE_PATH = new URL("../../", import.meta.url).pathname;
const EXERCISES_PATH = `${BASE_PATH}exercises`;
const PROGRESSIONS_PATH = `${BASE_PATH}progressions`;

export interface LoadedData {
  exercises: Map<string, Exercise>;
  workouts: Map<string, Workout>;
  routines: Map<string, Routine>;
  progressions: Map<string, Progression>;
}

async function loadJsonFiles<T>(
  fullPath: string,
  schema: { parse: (data: unknown) => T },
  silent = false
): Promise<Map<string, T>> {
  const map = new Map<string, T>();

  try {
    for await (const entry of walk(fullPath, {
      exts: [".json"],
      includeDirs: false,
    })) {
      try {
        const content = await Deno.readTextFile(entry.path);
        const data = JSON.parse(content);
        const validated = schema.parse(data);
        map.set((validated as { id: string }).id, validated);
      } catch (_e) {
        // Silently skip files that don't match schema (e.g., old format files)
        if (!silent) {
          // Only log in verbose mode
        }
      }
    }
  } catch (e) {
    // Directory might not exist
    if (!(e instanceof Deno.errors.NotFound)) {
      console.error(`Error walking ${fullPath}:`, e);
    }
  }

  return map;
}

export async function loadAll(): Promise<LoadedData> {
  const [exercises, workouts, routines, progressions] = await Promise.all([
    loadJsonFiles(EXERCISES_PATH, exerciseSchema, true),
    loadJsonFiles(`${BASE_PATH}workouts`, workoutSchema, true),
    loadJsonFiles(`${BASE_PATH}routines`, routineSchema, true),
    loadJsonFiles(PROGRESSIONS_PATH, progressionSchema, true),
  ]);

  return { exercises, workouts, routines, progressions };
}

export function getWorkoutsByRoutine(
  data: LoadedData,
  routineId: string
): Workout[] {
  return Array.from(data.workouts.values()).filter(
    (w) => w.routineId === routineId
  );
}

export function getRoutinesSorted(data: LoadedData): Routine[] {
  return Array.from(data.routines.values()).sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
}
