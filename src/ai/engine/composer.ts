/**
 * Workout Composer — deterministic workout builder.
 * Pattern + Intent + ExerciseIndex -> GeneratedWorkout (no LLM needed).
 */

import type {
  WorkoutIntent,
  WorkoutPattern,
  Criteria,
  GeneratedWorkout,
  GeneratedSet,
  GeneratedExercise,
} from "../types.ts";
import type { ExerciseIndex } from "./index.ts";
import { selectExercise } from "./criteria.ts";
import type { Progression } from "../types.ts";

function buildWorkCriteria(intent: WorkoutIntent, phaseHints?: Partial<Criteria>): Criteria {
  const criteria: Criteria = {};

  if (phaseHints) {
    Object.assign(criteria, phaseHints);
  }

  if (intent.muscles?.length) criteria.muscles = intent.muscles;
  if (intent.equipment?.length) criteria.equipment = intent.equipment;
  if (intent.type) criteria.types = [intent.type];
  if (intent.difficulty) criteria.difficulty = intent.difficulty;
  if (intent.excludeEquipment?.length) criteria.excludeEquipment = intent.excludeEquipment;
  if (intent.excludeTags?.length) criteria.excludeTags = intent.excludeTags;

  return criteria;
}

function defaultReps(intent: WorkoutIntent): string | number {
  const raw = intent.style;
  const style = (Array.isArray(raw) ? raw.join(" ") : String(raw ?? "")).toLowerCase();
  if (style.includes("strength") || style.includes("power")) return "5-8";
  if (style.includes("hypertrophy") || style.includes("muscle")) return "8-12";
  if (style.includes("endurance") || style.includes("cardio")) return "15-20";
  return "10-12";
}

export function composeWorkout(
  intent: WorkoutIntent,
  pattern: WorkoutPattern,
  index: ExerciseIndex,
  progressions: Map<string, Progression>,
): GeneratedWorkout {
  const used = new Set<string>();
  const sets: GeneratedSet[] = [];
  const reps = defaultReps(intent);

  for (const phase of pattern.phases) {
    const exercises: GeneratedExercise[] = [];

    for (let i = 0; i < phase.exercisesPerSet; i++) {
      const criteria = phase.type === "work"
        ? buildWorkCriteria(intent, phase.criteriaHints)
        : buildWorkCriteria(
            { ...intent, muscles: undefined, type: undefined, equipment: undefined, excludeEquipment: undefined },
            phase.criteriaHints,
          );

      const ex = selectExercise(index, progressions, criteria, used);
      if (ex) {
        const genEx: GeneratedExercise = {
          name: ex.name,
          id: ex.id,
        };
        if (phase.durationPerExercise) {
          genEx.duration = phase.durationPerExercise;
        } else {
          genEx.reps = reps;
        }
        exercises.push(genEx);
      }
    }

    if (exercises.length > 0) {
      sets.push({
        id: phase.name.toLowerCase().replace(/\s+/g, "-"),
        name: phase.name,
        type: "exercises",
        rounds: phase.rounds,
        exercises,
        restBetween: phase.restBetween,
        restAfter: phase.restAfter,
      });
    }
  }

  const allEquipment = new Set<string>();
  for (const set of sets) {
    for (const ex of set.exercises) {
      const full = index.get(ex.id);
      if (full) for (const e of full.equipment) allEquipment.add(e);
    }
  }

  let estMinutes = 0;
  for (const set of sets) {
    const exCount = set.exercises.length;
    const exTime = set.exercises.reduce((sum, ex) => sum + (ex.duration ?? 40), 0);
    const restTime = (set.restBetween ?? 0) * (exCount - 1) + (set.restAfter ?? 0);
    estMinutes += ((exTime + restTime) * set.rounds) / 60;
  }

  return {
    id: `generated-${Date.now()}`,
    name: "Generated Workout",
    description: intent.goals?.join(", "),
    difficulty: intent.difficulty,
    estimatedDuration: Math.round(estMinutes),
    equipment: Array.from(allEquipment).sort(),
    sets,
    pattern: pattern.id,
  };
}
