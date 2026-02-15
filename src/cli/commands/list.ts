import { loadAll, getRoutinesSorted, getWorkoutsByRoutine } from "../loader.ts";

const QUICK_COMMANDS = `
⚡ QUICK COMMANDS

  Routines:
    deno task wod:morning       🌅 Morning mobility flow
    deno task wod:barre         🩰 Barre workout
    deno task wod:yoga          🧘 Yoga flow
    deno task wod:maternity     🤰 Maternity gentle flow
    deno task wod:gym           🏋️ Random gym workout
    deno task wod:cardio        ❤️‍🔥 Random cardio workout
    deno task wod:aj            ✨ Action Jacqueline barre

  Gym Workouts:
    deno task wod:gym:4x4       4x4x3 floor & bench (dumbbells, kettlebells, barbells)
    deno task wod:gym:machines  Machine circuit (beginner-friendly)
    deno task wod:gym:apartment Apartment gym (Smith machine + bench)
    deno task wod:gym:squat     Squat rack power session
    deno task wod:gym:rrr       🎲 Reddit RRR (random progression levels)

  Cardio Workouts:
    deno task wod:cardio:running 🏃 Fartlek run (30 min intervals)
    deno task wod:cardio:rowing  🚣 ERG rowing intervals

  Saved Workouts:
    deno task wod:saved         💾 List saved favorites
    deno task wod:load <name>   📂 Load a saved workout

  Other:
    deno task wod:random        Random gym workout
    deno task wod:workouts      List all workouts
    deno task wod:list          This list

  Save a workout:
    deno task wod:gym --save=my-favorite
`;

export async function listCommand(args: string[]): Promise<void> {
  const data = await loadAll();

  const what = args[0] || "routines";
  const routineFilter = args.find(a => a.startsWith("--routine="))?.split("=")[1];

  if (what === "routines") {
    console.log("\n📋 ROUTINES\n");
    const routines = getRoutinesSorted(data);

    if (routines.length === 0) {
      console.log("  No routines found.");
      return;
    }

    for (const routine of routines) {
      const workouts = getWorkoutsByRoutine(data, routine.id);
      console.log(`  ${routine.icon || "•"} ${routine.name} (${workouts.length} workouts)`);
      console.log(`    ID: ${routine.id}`);
      if (routine.description) {
        console.log(`    ${routine.description}`);
      }
      console.log();
    }

    // Show quick commands
    console.log(QUICK_COMMANDS);
  } else if (what === "workouts") {
    console.log("\n🏋️ WORKOUTS\n");

    let workouts = Array.from(data.workouts.values());

    if (routineFilter) {
      workouts = workouts.filter(w => w.routineId === routineFilter);
      console.log(`  Filtered by routine: ${routineFilter}\n`);
    }

    if (workouts.length === 0) {
      console.log("  No workouts found.");
      return;
    }

    // Group by routine
    const byRoutine = new Map<string, typeof workouts>();
    for (const w of workouts) {
      const key = w.routineId || "uncategorized";
      if (!byRoutine.has(key)) byRoutine.set(key, []);
      byRoutine.get(key)!.push(w);
    }

    for (const [routineId, routineWorkouts] of byRoutine) {
      const routine = data.routines.get(routineId);
      console.log(`  ${routine?.icon || "•"} ${routine?.name || routineId}`);

      for (const w of routineWorkouts) {
        const duration = w.estimatedDuration ? `~${w.estimatedDuration}m` : "";
        const difficulty = w.difficulty ? `[${w.difficulty}]` : "";
        console.log(`    - ${w.name} ${duration} ${difficulty}`);
        console.log(`      ID: ${w.id}`);
      }
      console.log();
    }
  } else if (what === "exercises") {
    console.log("\n💪 EXERCISES\n");
    console.log(`  Total: ${data.exercises.size} exercises`);

    // Group by type
    const byType = new Map<string, number>();
    for (const e of data.exercises.values()) {
      byType.set(e.type, (byType.get(e.type) || 0) + 1);
    }

    console.log("\n  By type:");
    for (const [type, count] of Array.from(byType.entries()).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${type}: ${count}`);
    }
  } else {
    console.log(`Unknown list type: ${what}`);
    console.log("Usage: list [routines|workouts|exercises] [--routine=<id>]");
  }
}
