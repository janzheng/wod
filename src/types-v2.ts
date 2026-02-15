// Re-export all types from schemas-v2
export type {
  Difficulty,
  Reps,
  Criteria,
  SetExercise,
  Activity,
  SetType,
  WorkoutSet,
  Workout,
  RoutineDefaults,
  Routine,
  CatalogueV2,
} from "./schemas-v2.ts";

// Re-export schemas for validation
export {
  difficultySchema,
  repsSchema,
  criteriaSchema,
  setExerciseSchema,
  activitySchema,
  setTypeSchema,
  workoutSetSchema,
  workoutSchema,
  routineDefaultsSchema,
  routineSchema,
} from "./schemas-v2.ts";
