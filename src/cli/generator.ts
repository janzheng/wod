import type { Workout, WorkoutSet, SetExercise, Criteria, Progression } from "../schemas-v2.ts";
import type { Exercise, MediaItem } from "../schemas.ts";

export interface GeneratedExercise {
  name: string;
  id: string;
  reps?: string | number;
  duration?: number;
  tempo?: string;
  notes?: string;
  description?: string;
  media?: MediaItem[];
  challengeDay?: number;
}

export interface GeneratedSet {
  id: string;
  name?: string;
  type: string;
  rounds: number;
  exercises: GeneratedExercise[];
  restBetween?: number;
  restAfter?: number;
  activity?: {
    name: string;
    duration?: number;
    distance?: string;
    intensity?: string;
    notes?: string;
  };
  restDuration?: number;
}

export interface ExerciseLegend {
  name: string;
  id: string;
  description?: string;
  media?: MediaItem[];
  challengeDay?: number;
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  description?: string;
  routineId?: string;
  creator?: string;
  source?: string;
  sourceUrl?: string;
  difficulty?: string;
  estimatedDuration?: number;
  equipment?: string[];
  sets: GeneratedSet[];
  tips?: string[];
  legend?: ExerciseLegend[];
}

function matchesCriteria(exercise: Exercise, criteria: Criteria): boolean {
  // If specific exerciseId, only match that
  if (criteria.exerciseId) {
    return exercise.id === criteria.exerciseId;
  }

  // Check type filter (OR within array)
  if (criteria.types && criteria.types.length > 0) {
    if (!criteria.types.includes(exercise.type)) {
      return false;
    }
  }

  // Check category filter (OR within array)
  if (criteria.categories && criteria.categories.length > 0) {
    if (!exercise.category || !criteria.categories.includes(exercise.category)) {
      return false;
    }
  }

  // Check muscle filter (OR within array)
  if (criteria.muscles && criteria.muscles.length > 0) {
    const hasMatch = criteria.muscles.some((m) => exercise.muscles.includes(m));
    if (!hasMatch) return false;
  }

  // Check tag filter (OR within array)
  if (criteria.tags && criteria.tags.length > 0) {
    const hasMatch = criteria.tags.some((t) => exercise.tags.includes(t));
    if (!hasMatch) return false;
  }

  // Check equipment filter (OR within array)
  if (criteria.equipment && criteria.equipment.length > 0) {
    const hasMatch = criteria.equipment.some((e) =>
      exercise.equipment.includes(e)
    );
    if (!hasMatch) return false;
  }

  // Check exclusions
  if (criteria.excludeTags && criteria.excludeTags.length > 0) {
    const hasExcluded = criteria.excludeTags.some((t) =>
      exercise.tags.includes(t)
    );
    if (hasExcluded) return false;
  }

  if (criteria.excludeEquipment && criteria.excludeEquipment.length > 0) {
    const hasExcluded = criteria.excludeEquipment.some((e) =>
      exercise.equipment.includes(e)
    );
    if (hasExcluded) return false;
  }

  // Check difficulty
  if (criteria.difficulty && exercise.difficulty !== criteria.difficulty) {
    return false;
  }

  // Check challenge filters
  if (criteria.challengeId) {
    if (!exercise.challenge || exercise.challenge.id !== criteria.challengeId) {
      return false;
    }
  }

  if (criteria.challengeCreator) {
    if (!exercise.challenge || exercise.challenge.creator !== criteria.challengeCreator) {
      return false;
    }
  }

  return true;
}

function selectExercise(
  exercises: Map<string, Exercise>,
  progressions: Map<string, Progression>,
  criteria: Criteria | undefined,
  used: Set<string>,
  poolSize?: number
): Exercise | null {
  if (!criteria) return null;
  // If progression is specified, pick random exercise from that chain
  if (criteria.progression) {
    const progression = progressions.get(criteria.progression);
    if (progression) {
      // Get all valid exercises from the progression that exist in our catalogue
      const validIds = progression.exercises.filter((id) => exercises.has(id));
      if (validIds.length > 0) {
        // Pick a random one (future: use user's level)
        const selectedId = validIds[Math.floor(Math.random() * validIds.length)];
        const exercise = exercises.get(selectedId);
        if (exercise) {
          used.add(exercise.id);
          return exercise;
        }
      }
    }
    // Progression not found or no valid exercises - fall through to other criteria
  }

  // Get all matching exercises
  let candidates = Array.from(exercises.values()).filter((e) =>
    matchesCriteria(e, criteria)
  );

  // Limit pool size if specified
  if (poolSize && candidates.length > poolSize) {
    // Shuffle and take first N
    candidates = candidates.sort(() => Math.random() - 0.5).slice(0, poolSize);
  }

  // Prefer unused exercises
  const unused = candidates.filter((e) => !used.has(e.id));
  if (unused.length > 0) {
    const selected = unused[Math.floor(Math.random() * unused.length)];
    used.add(selected.id);
    return selected;
  }

  // Fall back to any candidate if all used
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  return null;
}

function generateSetExercises(
  setExercises: SetExercise[],
  exercises: Map<string, Exercise>,
  progressions: Map<string, Progression>,
  randomize: boolean,
  poolSize?: number,
  fixedVariants?: Array<{ id: string; name?: string; exercises: SetExercise[] }>,
  fixedVariantChance?: number
): GeneratedExercise[] {
  const used = new Set<string>();
  const result: GeneratedExercise[] = [];

  // Check if we should use a fixed variant instead
  if (fixedVariants && fixedVariants.length > 0) {
    const chance = fixedVariantChance ?? 0.3;
    if (Math.random() < chance) {
      const selectedVariant = fixedVariants[Math.floor(Math.random() * fixedVariants.length)];
      
      // Use exercises from the fixed variant
      for (const variantEx of selectedVariant.exercises || []) {
        let exercise: Exercise | null = null;
        
        // If static exercise ID is provided, look it up directly
        if (variantEx.id && !variantEx.criteria) {
          exercise = exercises.get(variantEx.id) || null;
        } else if (variantEx.criteria) {
          // Handle criteria-based exercises in fixed variants (e.g., progressions)
          exercise = selectExercise(exercises, progressions, variantEx.criteria, used, poolSize);
        }
        
        if (exercise) {
          used.add(exercise.id);
          result.push({
            name: exercise.name,
            id: exercise.id,
            reps: variantEx.reps,
            duration: variantEx.duration,
            tempo: variantEx.tempo,
            notes: variantEx.notes,
            description: exercise.description,
            media: exercise.media,
            challengeDay: exercise.challenge?.day,
          });
        } else if (variantEx.id && variantEx.name) {
          // Static exercise not in catalog
          result.push({
            name: variantEx.name,
            id: variantEx.id,
            reps: variantEx.reps,
            duration: variantEx.duration,
            tempo: variantEx.tempo,
            notes: variantEx.notes,
          });
        } else if (variantEx.criteria) {
          // Criteria-based exercise that didn't match
          result.push({
            name: `[No match: ${JSON.stringify(variantEx.criteria)}]`,
            id: "unknown",
            reps: variantEx.reps,
            duration: variantEx.duration,
            notes: variantEx.notes,
          });
        }
      }
      
      return result;
    }
  }

  // If randomize, shuffle the order
  const orderedExercises = randomize
    ? [...setExercises].sort(() => Math.random() - 0.5)
    : setExercises;

  for (const se of orderedExercises) {
    let exercise: Exercise | null = null;
    
    // If static exercise ID is provided, look it up directly
    if (se.id && !se.criteria) {
      exercise = exercises.get(se.id) || null;
    } else if (se.criteria) {
      exercise = selectExercise(exercises, progressions, se.criteria, used, poolSize);
    }
    
    if (exercise) {
      result.push({
        name: exercise.name,
        id: exercise.id,
        reps: se.reps,
        duration: se.duration,
        tempo: se.tempo,
        notes: se.notes,
        description: exercise.description,
        media: exercise.media,
        challengeDay: exercise.challenge?.day,
      });
    } else if (se.id && se.name) {
      // Static exercise not in catalog
      result.push({
        name: se.name,
        id: se.id,
        reps: se.reps,
        duration: se.duration,
        tempo: se.tempo,
        notes: se.notes,
      });
    } else {
      // No matching exercise found - use criteria description
      result.push({
        name: `[No match: ${JSON.stringify(se.criteria || se.id)}]`,
        id: "unknown",
        reps: se.reps,
        duration: se.duration,
        notes: se.notes,
      });
    }
  }

  return result;
}

export function generateWorkout(
  workout: Workout,
  exercises: Map<string, Exercise>,
  progressions: Map<string, Progression> = new Map(),
  workouts?: Map<string, Workout>
): GeneratedWorkout {
  // Check if we should use a fixed alternative workout instead
  if (workout.fixedAlternatives && workout.fixedAlternatives.length > 0 && workouts) {
    const chance = workout.fixedAlternativeChance ?? 0.4;
    if (Math.random() < chance) {
      // Shuffle alternatives and try to find one that exists
      const shuffledAlternatives = [...workout.fixedAlternatives].sort(() => Math.random() - 0.5);
      for (const alternativeId of shuffledAlternatives) {
        const alternativeWorkout = workouts.get(alternativeId);
        if (alternativeWorkout) {
          // Recursively generate the alternative workout (but don't check alternatives again to avoid infinite loops)
          const altWorkout = { ...alternativeWorkout, fixedAlternatives: undefined };
          const generated = generateWorkout(altWorkout, exercises, progressions, workouts);
          // Preserve the original workout's ID so it can be tracked properly
          return { ...generated, id: workout.id, _originalId: workout.id, _selectedAlternative: alternativeId };
        }
      }
      // If no alternative was found, log warning and fall through to generate original workout
      console.warn('No valid fixed alternative found for workout:', workout.id, 'Alternatives:', workout.fixedAlternatives);
    }
  }

  const generatedSets: GeneratedSet[] = [];

  for (const set of workout.sets) {
    const generatedSet: GeneratedSet = {
      id: set.id,
      name: set.name,
      type: set.type,
      rounds: set.rounds ?? 1,
      exercises: [],
      restBetween: set.restBetween,
      restAfter: set.restAfter,
    };

    if (set.type === "exercises" || set.type === "superset") {
      if (set.exercises) {
        generatedSet.exercises = generateSetExercises(
          set.exercises,
          exercises,
          progressions,
          set.randomize ?? false,
          set.poolSize,
          set.fixedVariants,
          set.fixedVariantChance
        );
      }
    } else if (set.type === "activity" && set.activity) {
      generatedSet.activity = set.activity;
    } else if (set.type === "rest") {
      generatedSet.restDuration = set.restDuration;
    }

    generatedSets.push(generatedSet);
  }

  // Build legend from all unique exercises with descriptions
  const seenExercises = new Map<string, ExerciseLegend>();
  for (const set of generatedSets) {
    for (const ex of set.exercises) {
      if (ex.id !== "unknown" && !seenExercises.has(ex.id)) {
        seenExercises.set(ex.id, {
          name: ex.name,
          id: ex.id,
          description: ex.description,
          media: ex.media,
          challengeDay: ex.challengeDay,
        });
      }
    }
  }

  return {
    id: workout.id,
    name: workout.name,
    description: workout.description,
    routineId: workout.routineId,
    creator: workout.creator,
    source: workout.source,
    sourceUrl: workout.sourceUrl,
    difficulty: workout.difficulty,
    estimatedDuration: workout.estimatedDuration,
    equipment: workout.equipment,
    sets: generatedSets,
    tips: workout.tips,
    legend: seenExercises.size > 0 ? Array.from(seenExercises.values()) : undefined,
  };
}
