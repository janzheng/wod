import { loadAll, getWorkoutsByRoutine, getRoutinesSorted } from "../loader.ts";
import { generateWorkout } from "../generator.ts";
import { formatWorkout, formatWorkoutJson } from "../formatter.ts";

const SAVED_DIR = new URL("../../../saved", import.meta.url).pathname;

interface GenerateOptions {
  routine?: string;
  workout?: string;
  random?: boolean;
  json?: boolean;
  save?: string;
  freeze?: boolean;
}

function parseArgs(args: string[]): GenerateOptions {
  const options: GenerateOptions = {};

  for (const arg of args) {
    if (arg.startsWith("--routine=")) {
      options.routine = arg.split("=")[1];
    } else if (arg.startsWith("--workout=")) {
      options.workout = arg.split("=")[1];
    } else if (arg.startsWith("--save=")) {
      options.save = arg.split("=")[1];
    } else if (arg === "--random") {
      options.random = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--freeze") {
      options.freeze = true;
    } else if (!arg.startsWith("--")) {
      // Positional arg - treat as workout or routine
      options.workout = arg;
    }
  }

  return options;
}

async function ensureSavedDir(): Promise<void> {
  try {
    await Deno.mkdir(SAVED_DIR, { recursive: true });
  } catch (e) {
    if (!(e instanceof Deno.errors.AlreadyExists)) {
      throw e;
    }
  }
}

async function saveReference(name: string, workoutId: string): Promise<string> {
  await ensureSavedDir();

  const filename = `${name}.json`;
  const filepath = `${SAVED_DIR}/${filename}`;

  const saveData = {
    workoutRef: workoutId,
    savedAt: new Date().toISOString(),
    alias: name,
  };

  await Deno.writeTextFile(filepath, JSON.stringify(saveData, null, 2));
  return filepath;
}

async function saveFrozen(name: string, generated: unknown): Promise<string> {
  await ensureSavedDir();

  const filename = `${name}.json`;
  const filepath = `${SAVED_DIR}/${filename}`;

  const saveData = {
    id: name,
    savedAt: new Date().toISOString(),
    ...generated as Record<string, unknown>,
  };

  await Deno.writeTextFile(filepath, JSON.stringify(saveData, null, 2));
  return filepath;
}

export async function generateCommand(args: string[]): Promise<void> {
  const data = await loadAll();
  const options = parseArgs(args);

  let workout;

  if (options.workout) {
    // Direct workout selection
    workout = data.workouts.get(options.workout);
    if (!workout) {
      console.error(`Workout not found: ${options.workout}`);
      console.log("\nAvailable workouts:");
      for (const w of data.workouts.values()) {
        console.log(`  - ${w.id}`);
      }
      return;
    }
  } else if (options.routine) {
    // Select from routine
    const routineWorkouts = getWorkoutsByRoutine(data, options.routine);

    if (routineWorkouts.length === 0) {
      console.error(`No workouts found for routine: ${options.routine}`);
      console.log("\nAvailable routines:");
      for (const r of getRoutinesSorted(data)) {
        console.log(`  - ${r.id}: ${r.name}`);
      }
      return;
    }

    if (options.random) {
      // Random workout from routine
      workout = routineWorkouts[Math.floor(Math.random() * routineWorkouts.length)];
    } else {
      // First workout from routine
      workout = routineWorkouts[0];
      if (routineWorkouts.length > 1) {
        console.log(`Note: ${routineWorkouts.length} workouts available. Using first. Add --random for random selection.`);
      }
    }
  } else {
    // No selection - show help
    console.log("\nUsage: generate [options]");
    console.log("\nOptions:");
    console.log("  --workout=<id>    Generate specific workout");
    console.log("  --routine=<id>    Generate workout from routine");
    console.log("  --random          Random selection from routine");
    console.log("  --json            Output as JSON");
    console.log("  --save=<name>     Save as favorite (reference to master)");
    console.log("  --freeze          With --save: freeze current generation");
    console.log("\nExamples:");
    console.log("  generate --workout=simple-barre");
    console.log("  generate --routine=barre --random");
    console.log("  generate --workout=aj-standing-barre --save=my-barre");
    console.log("  generate --routine=gym --random --save=gym-day --freeze");
    console.log("\nAvailable routines:");
    for (const r of getRoutinesSorted(data)) {
      const workouts = getWorkoutsByRoutine(data, r.id);
      console.log(`  - ${r.id} (${workouts.length} workouts)`);
    }
    return;
  }

  // Generate the workout (pass workouts map for fixedAlternatives support)
  const generated = generateWorkout(workout, data.exercises, data.progressions, data.workouts);

  // Output
  if (options.json) {
    console.log(formatWorkoutJson(generated));
  } else {
    console.log(formatWorkout(generated));
  }

  // Save if requested
  if (options.save) {
    if (options.freeze) {
      // Save frozen snapshot with all generated data
      const filepath = await saveFrozen(options.save, generated);
      console.log(`\n❄️ Frozen as: ${options.save}`);
      console.log(`   Path: ${filepath}`);
    } else {
      // Save reference to the workout definition
      const filepath = await saveReference(options.save, workout.id);
      console.log(`\n💾 Saved as: ${options.save} → ${workout.id}`);
      console.log(`   Path: ${filepath}`);
    }
  }
}
