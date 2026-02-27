import { assert } from "jsr:@std/assert";
import { loadData } from "../../engine/loader.ts";
import { ExerciseIndex } from "../../engine/index.ts";
import { matchesCriteria, selectExercise } from "../../engine/criteria.ts";

const DATA_DIR = new URL("../../../../", import.meta.url).pathname;

async function setup() {
  const data = await loadData(DATA_DIR);
  const index = new ExerciseIndex(data.exercises);
  return { data, index };
}

Deno.test("criteria: exerciseId matches exactly", async () => {
  const { data } = await setup();
  const push = data.exercises.get("push-up");
  assert(push, "push-up should exist");
  assert(matchesCriteria(push, { exerciseId: "push-up" }));
  assert(!matchesCriteria(push, { exerciseId: "squat" }));
});

Deno.test("criteria: muscles uses OR logic", async () => {
  const { data } = await setup();
  const push = data.exercises.get("push-up");
  assert(push, "push-up should exist");
  assert(matchesCriteria(push, { muscles: ["chest"] }));
  assert(matchesCriteria(push, { muscles: ["triceps"] }));
  assert(matchesCriteria(push, { muscles: ["chest", "biceps"] }));
});

Deno.test("criteria: AND between fields", async () => {
  const { data } = await setup();
  const push = data.exercises.get("push-up");
  assert(push, "push-up should exist");
  assert(matchesCriteria(push, { muscles: ["chest"], equipment: ["bodyweight"] }));
  assert(!matchesCriteria(push, { muscles: ["chest"], equipment: ["barbell"] }));
});

Deno.test("criteria: categories matching", async () => {
  const { data } = await setup();
  // Find an exercise with a category
  let found = false;
  for (const ex of data.exercises.values()) {
    if (ex.category) {
      assert(matchesCriteria(ex, { categories: [ex.category] }));
      found = true;
      break;
    }
  }
  assert(found, "Should find at least one exercise with a category");
});

Deno.test("criteria: excludeTags removes matching exercises", async () => {
  const { data } = await setup();
  for (const ex of data.exercises.values()) {
    if (ex.tags.includes("yoga")) {
      assert(!matchesCriteria(ex, { excludeTags: ["yoga"] }));
    }
  }
});

Deno.test("criteria: selectExercise prefers unused", async () => {
  const { index, data } = await setup();
  const used = new Set<string>();
  const criteria = { muscles: ["chest"], equipment: ["bodyweight"] };

  const first = selectExercise(index, data.progressions, criteria, used);
  assert(first, "Should find an exercise");
  assert(used.has(first.id), "Should mark as used");

  const second = selectExercise(index, data.progressions, criteria, used);
  assert(second, "Should find another exercise");
});

Deno.test("criteria: selectExercise with progression", async () => {
  const { index, data } = await setup();
  if (data.progressions.size === 0) return;

  const firstProgression = data.progressions.values().next().value;
  assert(firstProgression, "Should have a progression");

  const used = new Set<string>();
  const ex = selectExercise(index, data.progressions, { progression: firstProgression.id }, used);
  if (ex) {
    assert(firstProgression.exercises.includes(ex.id), "Should be from the progression chain");
  }
});
