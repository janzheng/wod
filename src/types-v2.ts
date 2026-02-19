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
  ProgramDayType,
  ProgramDayOption,
  ProgramDay,
  Program,
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
  programDayTypeSchema,
  programDayOptionSchema,
  programDaySchema,
  programSchema,
} from "./schemas-v2.ts";
