/**
 * Template Matcher — find existing workout templates by fuzzy name/tag match,
 * then re-roll exercises while keeping the structure.
 */

import type {
  Workout,
  Progression,
  GeneratedWorkout,
  GeneratedSet,
  GeneratedExercise,
  WorkoutIntent,
} from "../types.ts";
import type { ExerciseIndex } from "./index.ts";
import { selectExercise } from "./criteria.ts";

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreMatch(workout: Workout, query: string): number {
  const q = normalize(query);
  const tokens = q.split(" ");
  let score = 0;

  const id = normalize(workout.id);
  const name = normalize(workout.name);
  const desc = normalize(workout.description ?? "");
  const tags = workout.tags.map(normalize).join(" ");

  if (id === q.replace(/ /g, "-")) return 100;
  if (name.includes(q)) score += 50;

  for (const t of tokens) {
    if (id.includes(t)) score += 10;
    if (name.includes(t)) score += 8;
    if (tags.includes(t)) score += 5;
    if (desc.includes(t)) score += 3;
  }

  if (workout.routineId && tokens.includes(normalize(workout.routineId))) score += 15;

  return score;
}

export function findTemplate(
  workouts: Map<string, Workout>,
  query: string,
): Workout | null {
  let best: Workout | null = null;
  let bestScore = 0;

  for (const workout of workouts.values()) {
    const score = scoreMatch(workout, query);
    if (score > bestScore) {
      bestScore = score;
      best = workout;
    }
  }

  return bestScore > 0 ? best : null;
}

export function findTemplates(
  workouts: Map<string, Workout>,
  query: string,
  limit = 5,
): Workout[] {
  const scored = Array.from(workouts.values())
    .map(w => ({ workout: w, score: scoreMatch(w, query) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(x => x.workout);
}

export function rerollTemplate(
  template: Workout,
  index: ExerciseIndex,
  progressions: Map<string, Progression>,
  modifications?: WorkoutIntent["modifications"],
): GeneratedWorkout {
  const used = new Set<string>();
  const sets: GeneratedSet[] = [];

  for (const tSet of template.sets) {
    const exercises: GeneratedExercise[] = [];

    if (tSet.exercises) {
      for (const tEx of tSet.exercises) {
        const criteria = tEx.criteria ?? (tEx.id ? { exerciseId: tEx.id } : undefined);
        const ex = selectExercise(index, progressions, criteria, used);
        if (ex) {
          exercises.push({
            name: ex.name,
            id: ex.id,
            reps: tEx.reps,
            duration: typeof tEx.duration === "number" ? tEx.duration : undefined,
            tempo: tEx.tempo ?? undefined,
            notes: tEx.notes,
          });
        }
      }
    }

    let rounds = tSet.rounds ?? 1;
    let restBetween = tSet.restBetween;
    let restAfter = tSet.restAfter;

    if (modifications) {
      if (modifications.harder) {
        rounds = Math.min(rounds + 1, 6);
        if (restBetween) restBetween = Math.max(restBetween - 10, 5);
      }
      if (modifications.easier) {
        rounds = Math.max(rounds - 1, 1);
        if (restBetween) restBetween += 15;
      }
      if (modifications.longer) {
        rounds = Math.min(rounds + 1, 6);
      }
      if (modifications.shorter) {
        rounds = Math.max(rounds - 1, 1);
      }
    }

    sets.push({
      id: tSet.id,
      name: tSet.name,
      type: tSet.type,
      rounds,
      exercises,
      restBetween,
      restAfter,
    });
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
    const exTime = set.exercises.reduce((sum, ex) => sum + (ex.duration ?? 40), 0);
    const restTime = (set.restBetween ?? 0) * (set.exercises.length - 1) + (set.restAfter ?? 0);
    estMinutes += ((exTime + restTime) * set.rounds) / 60;
  }

  return {
    id: `reroll-${template.id}-${Date.now()}`,
    name: `${template.name} (Remix)`,
    description: template.description,
    routineId: template.routineId,
    difficulty: template.difficulty,
    estimatedDuration: Math.round(estMinutes),
    equipment: Array.from(allEquipment).sort(),
    sets,
    tips: template.tips,
    sourceTemplate: template.id,
  };
}
