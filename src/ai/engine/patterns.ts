/**
 * Workout Patterns — 8 predefined templates the LLM can select from.
 */

import type { WorkoutPattern } from "../types.ts";

export const PATTERNS: WorkoutPattern[] = [
  {
    id: "block-training",
    name: "Block Training (4x4x3)",
    description: "4 blocks of 4 exercises, 3 rounds each. Classic strength training structure with focused muscle groups per block.",
    phases: [
      { name: "Warmup", type: "warmup", sets: 1, exercisesPerSet: 4, rounds: 1, restBetween: 10, restAfter: 60, durationPerExercise: 30, criteriaHints: { tags: ["warmup", "mobility"] } },
      { name: "Block 1", type: "work", sets: 1, exercisesPerSet: 4, rounds: 3, restBetween: 45, restAfter: 120 },
      { name: "Block 2", type: "work", sets: 1, exercisesPerSet: 4, rounds: 3, restBetween: 45, restAfter: 120 },
      { name: "Block 3", type: "work", sets: 1, exercisesPerSet: 4, rounds: 3, restBetween: 45, restAfter: 120 },
      { name: "Block 4", type: "work", sets: 1, exercisesPerSet: 4, rounds: 3, restBetween: 45, restAfter: 60 },
      { name: "Cooldown", type: "cooldown", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 0, restAfter: 0, durationPerExercise: 45, criteriaHints: { tags: ["stretch", "cooldown"] } },
    ],
    suitableFor: ["strength", "muscle-building", "gym", "full-body", "split"],
    durationRange: [40, 60],
  },
  {
    id: "classic-circuit",
    name: "Classic Circuit",
    description: "5-8 exercises performed back-to-back with minimal rest, repeated 3-4 rounds. Great for cardio + strength.",
    phases: [
      { name: "Warmup", type: "warmup", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 10, restAfter: 60, durationPerExercise: 30, criteriaHints: { tags: ["warmup", "mobility"] } },
      { name: "Circuit", type: "work", sets: 1, exercisesPerSet: 6, rounds: 3, restBetween: 15, restAfter: 90 },
      { name: "Cooldown", type: "cooldown", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 0, restAfter: 0, durationPerExercise: 45, criteriaHints: { tags: ["stretch", "cooldown"] } },
    ],
    suitableFor: ["cardio", "conditioning", "full-body", "home", "kettlebell", "bodyweight"],
    durationRange: [20, 40],
  },
  {
    id: "superset-pairs",
    name: "Superset Pairs",
    description: "Paired exercises (agonist/antagonist or upper/lower) with rest only between pairs. Efficient and balanced.",
    phases: [
      { name: "Warmup", type: "warmup", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 10, restAfter: 60, durationPerExercise: 30, criteriaHints: { tags: ["warmup", "mobility"] } },
      { name: "Superset A", type: "work", sets: 1, exercisesPerSet: 2, rounds: 4, restBetween: 0, restAfter: 90 },
      { name: "Superset B", type: "work", sets: 1, exercisesPerSet: 2, rounds: 4, restBetween: 0, restAfter: 90 },
      { name: "Superset C", type: "work", sets: 1, exercisesPerSet: 2, rounds: 4, restBetween: 0, restAfter: 90 },
      { name: "Finisher", type: "work", sets: 1, exercisesPerSet: 2, rounds: 3, restBetween: 15, restAfter: 60 },
      { name: "Cooldown", type: "cooldown", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 0, restAfter: 0, durationPerExercise: 45, criteriaHints: { tags: ["stretch", "cooldown"] } },
    ],
    suitableFor: ["strength", "muscle-building", "gym", "upper-body", "push-pull"],
    durationRange: [35, 55],
  },
  {
    id: "emom",
    name: "EMOM (Every Minute On the Minute)",
    description: "Perform prescribed reps at the start of each minute, rest for remainder. 12-20 minutes of work.",
    phases: [
      { name: "Warmup", type: "warmup", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 10, restAfter: 60, durationPerExercise: 30, criteriaHints: { tags: ["warmup", "mobility"] } },
      { name: "EMOM", type: "work", sets: 1, exercisesPerSet: 4, rounds: 4, restBetween: 0, restAfter: 0 },
      { name: "Cooldown", type: "cooldown", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 0, restAfter: 0, durationPerExercise: 45, criteriaHints: { tags: ["stretch", "cooldown"] } },
    ],
    suitableFor: ["conditioning", "crossfit", "kettlebell", "bodyweight", "cardio"],
    durationRange: [15, 30],
  },
  {
    id: "amrap",
    name: "AMRAP (As Many Rounds As Possible)",
    description: "Complete as many rounds as possible in a fixed time. 3-5 exercises, 12-20 minutes.",
    phases: [
      { name: "Warmup", type: "warmup", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 10, restAfter: 60, durationPerExercise: 30, criteriaHints: { tags: ["warmup", "mobility"] } },
      { name: "AMRAP", type: "work", sets: 1, exercisesPerSet: 4, rounds: 1, restBetween: 0, restAfter: 0 },
      { name: "Cooldown", type: "cooldown", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 0, restAfter: 0, durationPerExercise: 45, criteriaHints: { tags: ["stretch", "cooldown"] } },
    ],
    suitableFor: ["conditioning", "crossfit", "cardio", "bodyweight", "kettlebell"],
    durationRange: [15, 30],
  },
  {
    id: "tabata",
    name: "Tabata / Intervals",
    description: "20s work / 10s rest intervals. 8 rounds per exercise. High intensity, time-efficient.",
    phases: [
      { name: "Warmup", type: "warmup", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 10, restAfter: 60, durationPerExercise: 30, criteriaHints: { tags: ["warmup", "mobility"] } },
      { name: "Tabata 1", type: "work", sets: 1, exercisesPerSet: 2, rounds: 8, restBetween: 10, restAfter: 60, durationPerExercise: 20 },
      { name: "Tabata 2", type: "work", sets: 1, exercisesPerSet: 2, rounds: 8, restBetween: 10, restAfter: 60, durationPerExercise: 20 },
      { name: "Cooldown", type: "cooldown", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 0, restAfter: 0, durationPerExercise: 45, criteriaHints: { tags: ["stretch", "cooldown"] } },
    ],
    suitableFor: ["hiit", "cardio", "conditioning", "bodyweight", "quick"],
    durationRange: [15, 25],
  },
  {
    id: "ladder",
    name: "Ladder",
    description: "Ascending or descending rep scheme (1-2-3-4-5 or 10-8-6-4-2). Progressive challenge.",
    phases: [
      { name: "Warmup", type: "warmup", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 10, restAfter: 60, durationPerExercise: 30, criteriaHints: { tags: ["warmup", "mobility"] } },
      { name: "Ladder", type: "work", sets: 1, exercisesPerSet: 3, rounds: 5, restBetween: 30, restAfter: 90 },
      { name: "Burnout", type: "work", sets: 1, exercisesPerSet: 2, rounds: 3, restBetween: 15, restAfter: 60 },
      { name: "Cooldown", type: "cooldown", sets: 1, exercisesPerSet: 3, rounds: 1, restBetween: 0, restAfter: 0, durationPerExercise: 45, criteriaHints: { tags: ["stretch", "cooldown"] } },
    ],
    suitableFor: ["strength", "conditioning", "calisthenics", "bodyweight"],
    durationRange: [25, 40],
  },
  {
    id: "flow",
    name: "Flow / Sequence",
    description: "Flowing sequence of movements with smooth transitions. Yoga, barre, or mobility style.",
    phases: [
      { name: "Opening", type: "warmup", sets: 1, exercisesPerSet: 4, rounds: 1, restBetween: 0, restAfter: 30, durationPerExercise: 45, criteriaHints: { tags: ["warmup", "breath"] } },
      { name: "Standing Flow", type: "work", sets: 1, exercisesPerSet: 5, rounds: 2, restBetween: 0, restAfter: 30, durationPerExercise: 45 },
      { name: "Floor Flow", type: "work", sets: 1, exercisesPerSet: 5, rounds: 2, restBetween: 0, restAfter: 30, durationPerExercise: 45 },
      { name: "Closing", type: "cooldown", sets: 1, exercisesPerSet: 4, rounds: 1, restBetween: 0, restAfter: 0, durationPerExercise: 60, criteriaHints: { tags: ["stretch", "cooldown"] } },
    ],
    suitableFor: ["yoga", "barre", "mobility", "flexibility", "recovery", "morning"],
    durationRange: [15, 45],
  },
];

export function getPattern(id: string): WorkoutPattern | undefined {
  return PATTERNS.find(p => p.id === id);
}

export function listPatterns(): string {
  return PATTERNS.map(p => `- ${p.id}: ${p.name} — ${p.description} (${p.durationRange[0]}-${p.durationRange[1]} min)`).join("\n");
}

export function patternsForLLM(): string {
  return PATTERNS.map(p =>
    `${p.id}: ${p.name} — ${p.description} Best for: ${p.suitableFor.join(", ")}. Duration: ${p.durationRange[0]}-${p.durationRange[1]} min.`
  ).join("\n\n");
}
