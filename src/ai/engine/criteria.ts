/**
 * Criteria Matching Engine
 *
 * matchesCriteria(): does an exercise match a set of criteria?
 * selectExercise(): pick a random matching exercise, preferring unused ones.
 */

import type { Exercise, Criteria, Progression } from "../types.ts";
import type { ExerciseIndex } from "./index.ts";

export function matchesCriteria(exercise: Exercise, criteria: Criteria): boolean {
  if (criteria.exerciseId) {
    return exercise.id === criteria.exerciseId;
  }

  if (criteria.types?.length) {
    if (!criteria.types.includes(exercise.type)) return false;
  }

  if (criteria.categories?.length) {
    if (!exercise.category || !criteria.categories.includes(exercise.category)) return false;
  }

  if (criteria.muscles?.length) {
    if (!criteria.muscles.some(m => exercise.muscles.includes(m))) return false;
  }

  if (criteria.tags?.length) {
    if (!criteria.tags.some(t => exercise.tags.includes(t))) return false;
  }

  if (criteria.equipment?.length) {
    if (!criteria.equipment.some(e => exercise.equipment.includes(e))) return false;
  }

  if (criteria.excludeTags?.length) {
    if (criteria.excludeTags.some(t => exercise.tags.includes(t))) return false;
  }

  if (criteria.excludeEquipment?.length) {
    if (criteria.excludeEquipment.some(e => exercise.equipment.includes(e))) return false;
  }

  if (criteria.difficulty && exercise.difficulty !== criteria.difficulty) {
    return false;
  }

  return true;
}

export function selectExercise(
  index: ExerciseIndex,
  progressions: Map<string, Progression>,
  criteria: Criteria | undefined,
  used: Set<string>,
  poolSize?: number,
): Exercise | null {
  if (!criteria) return null;

  // Progression: pick random from chain
  if (criteria.progression) {
    const progression = progressions.get(criteria.progression);
    if (progression) {
      const validIds = progression.exercises.filter(id => index.get(id));
      if (validIds.length > 0) {
        const selectedId = validIds[Math.floor(Math.random() * validIds.length)];
        const exercise = index.get(selectedId);
        if (exercise) {
          used.add(exercise.id);
          return exercise;
        }
      }
    }
  }

  // Use index for fast query
  let candidates = index.query(criteria);

  // Limit pool if specified
  if (poolSize && candidates.length > poolSize) {
    candidates = candidates.sort(() => Math.random() - 0.5).slice(0, poolSize);
  }

  // Prefer unused
  const unused = candidates.filter(e => !used.has(e.id));
  if (unused.length > 0) {
    const selected = unused[Math.floor(Math.random() * unused.length)];
    used.add(selected.id);
    return selected;
  }

  // Fall back to any candidate
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  return null;
}
