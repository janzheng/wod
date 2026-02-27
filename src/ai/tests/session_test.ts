/**
 * Unit tests for session management.
 * Pure functions, no LLM, no network.
 */

import { assertEquals, assert, assertNotEquals } from "jsr:@std/assert";
import {
  createSession,
  addUserTurn,
  addAssistantTurn,
  getRecentTurns,
  getLastIntent,
  getLastWorkout,
} from "../session.ts";
import type { WorkoutIntent, GeneratedWorkout } from "../types.ts";

const MOCK_INTENT: WorkoutIntent = {
  mode: "freeform",
  duration: 30,
  muscles: ["chest", "back"],
  equipment: ["dumbbell"],
};

const MOCK_WORKOUT: GeneratedWorkout = {
  id: "test-workout-1",
  name: "Test Workout",
  estimatedDuration: 30,
  equipment: ["dumbbell"],
  sets: [{
    id: "set-1",
    name: "Work",
    type: "exercises",
    rounds: 3,
    exercises: [{ name: "Dumbbell Press", id: "dumbbell-press" }],
  }],
};

Deno.test("session: createSession produces valid ID", () => {
  const s = createSession();
  assert(s.id.startsWith("wod-"), "ID should start with wod-");
  assertEquals(s.turns.length, 0, "Should start empty");
  assert(s.createdAt > 0, "Should have timestamp");
});

Deno.test("session: addUserTurn appends without mutating original", () => {
  const s1 = createSession();
  const s2 = addUserTurn(s1, "make a leg workout", MOCK_INTENT);

  assertEquals(s1.turns.length, 0, "Original should be unchanged");
  assertEquals(s2.turns.length, 1, "New session should have 1 turn");
  assertEquals(s2.turns[0].role, "user");
  assertEquals(s2.turns[0].prompt, "make a leg workout");
  assertEquals(s2.turns[0].intent, MOCK_INTENT);
});

Deno.test("session: addAssistantTurn appends without mutating original", () => {
  const s1 = createSession();
  const s2 = addUserTurn(s1, "test", MOCK_INTENT);
  const s3 = addAssistantTurn(s2, MOCK_WORKOUT, { pass: true, score: 4, issues: [] });

  assertEquals(s2.turns.length, 1, "Previous should be unchanged");
  assertEquals(s3.turns.length, 2, "New session should have 2 turns");
  assertEquals(s3.turns[1].role, "assistant");
  assertEquals(s3.turns[1].workout?.name, "Test Workout");
  assertEquals(s3.turns[1].critique?.score, 4);
});

Deno.test("session: getRecentTurns returns correct window", () => {
  let s = createSession();
  for (let i = 0; i < 5; i++) {
    s = addUserTurn(s, `prompt ${i}`, MOCK_INTENT);
    s = addAssistantTurn(s, { ...MOCK_WORKOUT, name: `Workout ${i}` });
  }

  assertEquals(s.turns.length, 10);

  const recent = getRecentTurns(s, 4);
  assertEquals(recent.length, 4, "Should return last 4 turns");
  assertEquals(recent[0].prompt, "prompt 3");

  const all = getRecentTurns(s, 20);
  assertEquals(all.length, 10, "Should return all if maxTurns > total");
});

Deno.test("session: getLastIntent finds most recent user intent", () => {
  let s = createSession();
  const intent1: WorkoutIntent = { mode: "freeform", muscles: ["chest"] };
  const intent2: WorkoutIntent = { mode: "freeform", muscles: ["legs"] };

  s = addUserTurn(s, "chest workout", intent1);
  s = addAssistantTurn(s, MOCK_WORKOUT);
  s = addUserTurn(s, "make it legs instead", intent2);

  const last = getLastIntent(s);
  assertEquals(last?.muscles, ["legs"], "Should return most recent intent");
});

Deno.test("session: getLastWorkout finds most recent workout", () => {
  let s = createSession();
  const w1: GeneratedWorkout = { ...MOCK_WORKOUT, name: "First" };
  const w2: GeneratedWorkout = { ...MOCK_WORKOUT, name: "Second" };

  s = addUserTurn(s, "first request", MOCK_INTENT);
  s = addAssistantTurn(s, w1);
  s = addUserTurn(s, "second request", MOCK_INTENT);
  s = addAssistantTurn(s, w2);

  const last = getLastWorkout(s);
  assertEquals(last?.name, "Second", "Should return most recent workout");
});

Deno.test("session: empty session returns undefined for last intent/workout", () => {
  const s = createSession();
  assertEquals(getLastIntent(s), undefined);
  assertEquals(getLastWorkout(s), undefined);
});

Deno.test("session: IDs are unique across sessions", () => {
  const s1 = createSession();
  const s2 = createSession();
  assertNotEquals(s1.id, s2.id, "Session IDs should be unique");
});
