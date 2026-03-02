import { assertEquals, assert } from "jsr:@std/assert";
import { loadData } from "../../engine/loader.ts";

const DATA_DIR = new URL("../../../../", import.meta.url).pathname;

Deno.test("loader: loads all exercises without validation errors", async () => {
  const data = await loadData(DATA_DIR);
  assert(data.exercises.size >= 400, `Expected 400+ exercises, got ${data.exercises.size}`);
});

Deno.test("loader: loads all workouts from nested directories", async () => {
  const data = await loadData(DATA_DIR);
  assert(data.workouts.size >= 50, `Expected 50+ workouts, got ${data.workouts.size}`);
});

Deno.test("loader: loads routines", async () => {
  const data = await loadData(DATA_DIR);
  assert(data.routines.size >= 10, `Expected 10+ routines, got ${data.routines.size}`);
});

Deno.test("loader: loads progressions", async () => {
  const data = await loadData(DATA_DIR);
  assert(data.progressions.size >= 5, `Expected 5+ progressions, got ${data.progressions.size}`);
});

Deno.test("loader: exercise IDs are unique and kebab-case", async () => {
  const data = await loadData(DATA_DIR);
  const ids = new Set<string>();
  for (const [id, ex] of data.exercises) {
    assertEquals(id, ex.id, "Map key should match exercise ID");
    assert(/^[a-z0-9-]+$/.test(id), `ID should be kebab-case: ${id}`);
    assert(!ids.has(id), `Duplicate ID: ${id}`);
    ids.add(id);
  }
});

Deno.test("loader: exercises have required fields", async () => {
  const data = await loadData(DATA_DIR);
  for (const [id, ex] of data.exercises) {
    assert(ex.name.length > 0, `Exercise ${id} has empty name`);
    assert(ex.type.length > 0, `Exercise ${id} has empty type`);
    assert(ex.muscles.length > 0, `Exercise ${id} has no muscles`);
    assert(ex.equipment.length > 0, `Exercise ${id} has no equipment`);
  }
});
