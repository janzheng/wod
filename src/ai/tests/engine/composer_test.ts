import { assert } from "jsr:@std/assert";
import { loadData } from "../../engine/loader.ts";
import { ExerciseIndex } from "../../engine/index.ts";
import { composeWorkout } from "../../engine/composer.ts";
import { getPattern } from "../../engine/patterns.ts";
import type { WorkoutIntent } from "../../types.ts";

const DATA_DIR = new URL("../../../../", import.meta.url).pathname;

async function setup() {
  const data = await loadData(DATA_DIR);
  const index = new ExerciseIndex(data.exercises);
  return { data, index };
}

Deno.test("composer: block pattern produces warmup + blocks + cooldown", async () => {
  const { data, index } = await setup();
  const pattern = getPattern("block-training")!;
  const intent: WorkoutIntent = {
    mode: "freeform",
    duration: 45,
    muscles: ["chest", "back", "shoulders"],
    equipment: ["dumbbell", "barbell"],
  };

  const workout = composeWorkout(intent, pattern, index, data.progressions);
  assert(workout.sets.length >= 4, "Should have warmup + blocks + cooldown");
  assert(workout.sets[0].name?.toLowerCase().includes("warmup"), "First set should be warmup");

  for (const set of workout.sets) {
    for (const ex of set.exercises) {
      assert(index.get(ex.id), `Exercise ${ex.id} should exist in database`);
    }
  }
});

Deno.test("composer: circuit pattern fills exercise slots", async () => {
  const { data, index } = await setup();
  const pattern = getPattern("classic-circuit")!;
  const intent: WorkoutIntent = {
    mode: "freeform",
    muscles: ["glutes", "quads", "hamstrings"],
    equipment: ["bodyweight"],
  };

  const workout = composeWorkout(intent, pattern, index, data.progressions);
  const workSets = workout.sets.filter(s => s.name !== "Warmup" && s.name !== "Cooldown");
  assert(workSets.length > 0, "Should have work sets");
  for (const set of workSets) {
    assert(set.exercises.length > 0, `Work set ${set.id} should have exercises`);
  }
});

Deno.test("composer: no duplicate exercises in workout", async () => {
  const { data, index } = await setup();
  const pattern = getPattern("classic-circuit")!;
  const intent: WorkoutIntent = { mode: "freeform", equipment: ["bodyweight"] };

  const workout = composeWorkout(intent, pattern, index, data.progressions);
  const ids = workout.sets.flatMap(s => s.exercises.map(e => e.id));
  const unique = new Set(ids);
  assert(unique.size >= ids.length * 0.8, "Most exercises should be unique");
});

Deno.test("composer: flow pattern for yoga/barre", async () => {
  const { data, index } = await setup();
  const pattern = getPattern("flow")!;
  const intent: WorkoutIntent = { mode: "freeform", type: "barre" };

  const workout = composeWorkout(intent, pattern, index, data.progressions);
  assert(workout.sets.length > 0, "Should have sets");
  assert(workout.estimatedDuration! > 0, "Should estimate duration");
});

Deno.test("composer: equipment is collected from selected exercises", async () => {
  const { data, index } = await setup();
  const pattern = getPattern("classic-circuit")!;
  const intent: WorkoutIntent = { mode: "freeform", equipment: ["kettlebell"] };

  const workout = composeWorkout(intent, pattern, index, data.progressions);
  assert(workout.equipment!.length > 0, "Should list equipment");
  assert(workout.equipment!.includes("kettlebell"), "Should include kettlebell");
});
