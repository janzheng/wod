import { assertEquals, assert } from "jsr:@std/assert";
import { loadData } from "../../engine/loader.ts";
import { ExerciseIndex } from "../../engine/index.ts";

const DATA_DIR = new URL("../../../../", import.meta.url).pathname;

async function getIndex(): Promise<ExerciseIndex> {
  const data = await loadData(DATA_DIR);
  return new ExerciseIndex(data.exercises);
}

Deno.test("index: query by muscle returns matching exercises", async () => {
  const index = await getIndex();
  const results = index.query({ muscles: ["chest"] });
  assert(results.length > 0, "Should find chest exercises");
  for (const ex of results) {
    assert(ex.muscles.includes("chest"), `${ex.id} should have chest muscle`);
  }
});

Deno.test("index: query by muscle + equipment intersects correctly", async () => {
  const index = await getIndex();
  const results = index.query({ muscles: ["chest"], equipment: ["dumbbell"] });
  assert(results.length > 0, "Should find chest+dumbbell exercises");
  for (const ex of results) {
    assert(ex.muscles.includes("chest"), `${ex.id} should have chest`);
    assert(ex.equipment.includes("dumbbell"), `${ex.id} should have dumbbell`);
  }
});

Deno.test("index: query by category returns matching exercises", async () => {
  const index = await getIndex();
  const results = index.query({ categories: ["chest"] });
  assert(results.length > 0, "Should find exercises in chest category");
  for (const ex of results) {
    assert(ex.category === "chest", `${ex.id} should have chest category`);
  }
});

Deno.test("index: excludeTags filters correctly", async () => {
  const index = await getIndex();
  const results = index.query({ muscles: ["glutes"], excludeTags: ["yoga", "stretch"] });
  for (const ex of results) {
    assert(!ex.tags.includes("yoga"), `${ex.id} should not have yoga tag`);
    assert(!ex.tags.includes("stretch"), `${ex.id} should not have stretch tag`);
  }
});

Deno.test("index: empty criteria returns all exercises", async () => {
  const index = await getIndex();
  const results = index.query({});
  assertEquals(results.length, index.size);
});

Deno.test("index: getSummary returns compact string", async () => {
  const index = await getIndex();
  const summary = index.getSummary();
  assert(summary.includes("exercises"), "Should mention exercises");
  assert(summary.length < 1500, "Summary should be compact");
});

Deno.test("index: getVocabulary returns all field values", async () => {
  const index = await getIndex();
  const vocab = index.getVocabulary();
  assert(vocab.types.length > 3, "Should have multiple types");
  assert(vocab.muscles.length > 10, "Should have many muscles");
  assert(vocab.equipment.length > 5, "Should have multiple equipment");
  assert(vocab.tags.length > 20, "Should have many tags");
  assert(vocab.categories.length > 5, "Should have categories");
});
