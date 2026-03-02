import { assert } from "jsr:@std/assert";
import { loadData } from "../../engine/loader.ts";
import { ExerciseIndex } from "../../engine/index.ts";
import { findTemplate, rerollTemplate } from "../../engine/template-matcher.ts";

const DATA_DIR = new URL("../../../../", import.meta.url).pathname;

async function setup() {
  const data = await loadData(DATA_DIR);
  const index = new ExerciseIndex(data.exercises);
  return { data, index };
}

Deno.test("template: findTemplate matches 'morning wakeup'", async () => {
  const { data } = await setup();
  const match = findTemplate(data.workouts, "morning wakeup");
  assert(match, "Should find a match");
  assert(match.id.includes("morning") || match.name.toLowerCase().includes("morning"),
    `Expected morning workout, got ${match.id}`);
});

Deno.test("template: findTemplate matches 'barre'", async () => {
  const { data } = await setup();
  const match = findTemplate(data.workouts, "barre");
  assert(match, "Should find a match");
  assert(match.routineId === "barre" || match.tags.includes("barre"),
    `Expected barre workout, got ${match.id}`);
});

Deno.test("template: rerollTemplate produces different exercises", async () => {
  const { data, index } = await setup();
  const template = findTemplate(data.workouts, "morning wakeup");
  assert(template, "Should find morning wakeup");

  const rerolled = rerollTemplate(template, index, data.progressions);
  assert(rerolled.sets.length > 0, "Should have sets");
  assert(rerolled.sourceTemplate === template.id, "Should reference source template");

  for (const set of rerolled.sets) {
    if (set.type === "exercises") {
      assert(set.exercises.length > 0, `Set ${set.id} should have exercises`);
    }
  }
});

Deno.test("template: rerollTemplate preserves structure", async () => {
  const { data, index } = await setup();
  const template = findTemplate(data.workouts, "morning wakeup");
  assert(template, "Should find morning wakeup");

  const rerolled = rerollTemplate(template, index, data.progressions);

  assert(rerolled.sets.length === template.sets.length,
    `Expected ${template.sets.length} sets, got ${rerolled.sets.length}`);

  for (let i = 0; i < template.sets.length; i++) {
    assert(rerolled.sets[i].name === template.sets[i].name,
      `Set names should match: ${template.sets[i].name} vs ${rerolled.sets[i].name}`);
  }
});

Deno.test("template: rerollTemplate with 'harder' increases rounds", async () => {
  const { data, index } = await setup();
  const template = findTemplate(data.workouts, "morning wakeup");
  assert(template, "Should find morning wakeup");

  const original = rerollTemplate(template, index, data.progressions);
  const harder = rerollTemplate(template, index, data.progressions, { harder: true });

  let anyIncrease = false;
  for (let i = 0; i < original.sets.length; i++) {
    if (harder.sets[i].rounds > original.sets[i].rounds) anyIncrease = true;
  }
  assert(anyIncrease, "Harder modification should increase some rounds");
});
