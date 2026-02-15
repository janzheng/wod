import { formatWorkout, formatWorkoutJson } from "../formatter.ts";
import { loadAll } from "../loader.ts";
import { generateWorkout } from "../generator.ts";

const SAVED_DIR = new URL("../../../saved", import.meta.url).pathname;

interface LoadOptions {
  name?: string;
  json?: boolean;
  delete?: boolean;
}

interface SavedRef {
  workoutRef: string;  // Reference to workout ID
  savedAt: string;
  alias?: string;      // Optional display name
}

interface SavedFrozen {
  id: string;
  savedAt: string;
  name: string;
  sets: unknown[];
  [key: string]: unknown;
}

type SavedData = SavedRef | SavedFrozen;

function isReference(data: SavedData): data is SavedRef {
  return "workoutRef" in data && typeof data.workoutRef === "string";
}

function parseArgs(args: string[]): LoadOptions {
  const options: LoadOptions = {};

  for (const arg of args) {
    if (arg.startsWith("--name=")) {
      options.name = arg.split("=")[1];
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--delete") {
      options.delete = true;
    } else if (!arg.startsWith("--")) {
      options.name = arg;
    }
  }

  return options;
}

async function listSavedWorkouts(): Promise<{ name: string; savedAt: string; workoutName: string; isRef: boolean }[]> {
  const saved: { name: string; savedAt: string; workoutName: string; isRef: boolean }[] = [];

  try {
    for await (const entry of Deno.readDir(SAVED_DIR)) {
      if (entry.isFile && entry.name.endsWith(".json")) {
        try {
          const content = await Deno.readTextFile(`${SAVED_DIR}/${entry.name}`);
          const data = JSON.parse(content) as SavedData;

          if (isReference(data)) {
            saved.push({
              name: entry.name.replace(".json", ""),
              savedAt: data.savedAt || "unknown",
              workoutName: data.alias || data.workoutRef,
              isRef: true,
            });
          } else {
            saved.push({
              name: entry.name.replace(".json", ""),
              savedAt: data.savedAt || "unknown",
              workoutName: data.name || "unknown",
              isRef: false,
            });
          }
        } catch {
          // Skip invalid files
        }
      }
    }
  } catch {
    // Directory doesn't exist yet
  }

  return saved.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function loadCommand(args: string[]): Promise<void> {
  const options = parseArgs(args);

  if (!options.name) {
    // List saved workouts
    const saved = await listSavedWorkouts();

    if (saved.length === 0) {
      console.log("\n📂 No saved workouts yet.");
      console.log("\nTo save a workout reference:");
      console.log("  deno task wod:gym:4x4 --save=my-gym-day");
      console.log("\nTo save a frozen snapshot (random selections preserved):");
      console.log("  deno task wod:aj --save=todays-barre --freeze");
      return;
    }

    console.log("\n💾 SAVED WORKOUTS\n");
    for (const s of saved) {
      const date = new Date(s.savedAt).toLocaleDateString();
      const typeIcon = s.isRef ? "→" : "❄️";
      console.log(`  ${s.name} ${typeIcon}`);
      console.log(`    Workout: ${s.workoutName}`);
      console.log(`    Saved: ${date}`);
      console.log();
    }

    console.log("  → = reference (regenerates from master)");
    console.log("  ❄️ = frozen snapshot\n");

    console.log("To load a saved workout:");
    console.log("  deno task wod:load <name>");
    console.log("\nTo delete a saved workout:");
    console.log("  deno task wod:load <name> --delete");
    return;
  }

  const filepath = `${SAVED_DIR}/${options.name}.json`;

  // Check if file exists
  try {
    await Deno.stat(filepath);
  } catch {
    console.error(`Saved workout not found: ${options.name}`);
    const saved = await listSavedWorkouts();
    if (saved.length > 0) {
      console.log("\nAvailable saved workouts:");
      for (const s of saved) {
        console.log(`  - ${s.name}`);
      }
    }
    return;
  }

  // Delete if requested
  if (options.delete) {
    await Deno.remove(filepath);
    console.log(`🗑️  Deleted: ${options.name}`);
    return;
  }

  // Load the saved data
  const content = await Deno.readTextFile(filepath);
  const data = JSON.parse(content) as SavedData;

  if (isReference(data)) {
    // It's a reference - load and generate from the master workout
    const allData = await loadAll();
    const workout = allData.workouts.get(data.workoutRef);

    if (!workout) {
      console.error(`Referenced workout not found: ${data.workoutRef}`);
      console.log("\nThe saved reference points to a workout that no longer exists.");
      console.log("Available workouts:");
      for (const w of allData.workouts.values()) {
        console.log(`  - ${w.id}`);
      }
      return;
    }

    const generated = generateWorkout(workout, allData.exercises, allData.progressions, allData.workouts);
    const savedDate = new Date(data.savedAt).toLocaleDateString();

    console.log(`\n💾 Loaded: ${options.name} → ${data.workoutRef} (saved ${savedDate})\n`);

    if (options.json) {
      console.log(formatWorkoutJson(generated));
    } else {
      console.log(formatWorkout(generated));
    }
  } else {
    // It's a frozen snapshot - display as-is
    const { id: _id, savedAt, ...workout } = data;
    console.log(`\n❄️ Loaded: ${options.name} (frozen ${new Date(savedAt).toLocaleDateString()})\n`);

    if (options.json) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(formatWorkout(workout as Parameters<typeof formatWorkout>[0]));
    }
  }
}
