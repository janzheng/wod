import { z } from "zod";

// ============================================
// SHARED TYPES (reuse from original schemas)
// ============================================

export const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export type Difficulty = z.infer<typeof difficultySchema>;

// Rep format: number, "max", range like "5-8", min like "10+", or descriptive like "10 each"
export const repsSchema = z.union([
  z.number().int().positive(),
  z.literal("max"),
  z.string().regex(/^\d+-\d+$/, "Rep range: min-max (e.g., 5-8)"),
  z.string().regex(/^\d+\+$/, "Min reps: n+ (e.g., 10+)"),
  z.string().regex(/^\d+-\d+.*$/, "Rep range with notes (e.g., 10-12 each)"), // Allow "10-12 each", "10-1", etc.
  z.string().regex(/^\d+.*$/, "Reps with notes (e.g., 10 each)"), // Allow "10 each", "21s", etc.
]);
export type Reps = z.infer<typeof repsSchema>;

// ============================================
// CRITERIA (Simplified exercise matching)
// ============================================

export const criteriaSchema = z.object({
  // Specific exercise (highest priority - skips all filters)
  exerciseId: z.string().optional(),

  // Progression (picks random exercise from progression chain)
  progression: z.string().optional(),         // "push-up-progression"

  // Filters (OR logic within each, AND logic between fields)
  types: z.array(z.string()).optional(),      // ["barre", "yoga", "calisthenics"]
  categories: z.array(z.string()).optional(), // ["chest", "back-vertical-pull", "legs-quads"]
  muscles: z.array(z.string()).optional(),    // ["glutes", "quads", "core"]
  tags: z.array(z.string()).optional(),       // ["floor", "standing", "compound"]
  equipment: z.array(z.string()).optional(),  // ["bodyweight", "mat", "dumbbell"]

  // Challenge/creator filter
  challengeId: z.string().optional(),         // "100-reps-barre-leg-challenge"
  challengeCreator: z.string().optional(),    // "@actionjacquelyn"

  // Exclusions
  excludeTags: z.array(z.string()).optional(),
  excludeEquipment: z.array(z.string()).optional(),

  // Difficulty filter
  difficulty: difficultySchema.optional(),
});

export type Criteria = z.infer<typeof criteriaSchema>;

// ============================================
// SET EXERCISE (exercise within a set)
// ============================================

// Tempo notation: E-P1-C-P2 (Eccentric-Pause1-Concentric-Pause2)
// Example: "3-1-2-0" = 3s down, 1s pause, 2s up, no pause at top
// "1-0-X-0" = 1s down, explosive up
export const tempoSchema = z.string().regex(
  /^(\d+|X)-(\d+|X)-(\d+|X)-(\d+|X)$/,
  "Tempo format: E-P1-C-P2 (e.g., 3-1-2-0 or 1-0-X-0)"
).optional();

export type Tempo = z.infer<typeof tempoSchema>;

export const setExerciseSchema = z.object({
  criteria: criteriaSchema.optional(),  // Optional - can use id directly
  id: z.string().optional(),            // Direct exercise ID (alternative to criteria)
  name: z.string().optional(),          // Fallback name if exercise not found
  reps: repsSchema.optional(),          // 10, "max", "8-12", "10+"
  duration: z.number().optional(),      // seconds (alternative to reps)
  tempo: tempoSchema,                   // "3-1-2-0" for strength training
  notes: z.string().optional(),         // "slow tempo", "explosive", "each side"
  progressionId: z.string().optional(), // link to progression sequence for scaling
}).refine((data) => data.criteria || data.id, {
  message: "Either criteria or id must be provided",
});

export type SetExercise = z.infer<typeof setExerciseSchema>;

// ============================================
// ACTIVITY (for non-exercise sets)
// ============================================

export const activitySchema = z.object({
  name: z.string(),                     // "Outdoor Run", "ERG Row", "Walk"
  duration: z.number().optional(),      // minutes
  distance: z.string().optional(),      // "2km", "1 mile", "500m"
  intensity: z.string().optional(),     // "easy", "tempo", "intervals", "sprint"
  notes: z.string().optional(),
});

export type Activity = z.infer<typeof activitySchema>;

// ============================================
// SET (The atomic workout unit)
// ============================================

export const setTypeSchema = z.enum([
  "exercises",   // Standard exercise set
  "rest",        // Dedicated rest period
  "activity",    // Non-exercise (run, walk, row, bike)
  "superset",    // Exercises with minimal rest between (future-ready)
]);

export type SetType = z.infer<typeof setTypeSchema>;

export const fixedVariantSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  exercises: z.array(setExerciseSchema),
});

export type FixedVariant = z.infer<typeof fixedVariantSchema>;

export const workoutSetSchema = z.object({
  id: z.string(),
  name: z.string().optional(),          // "Leg Burner", "Core Finisher", "Warmup"

  // Set type determines behavior
  type: setTypeSchema,

  // For "exercises" and "superset" types
  exercises: z.array(setExerciseSchema).optional(),

  // Set-level execution
  rounds: z.number().int().positive().default(1),  // Repeat set N times
  restBetween: z.number().optional(),   // seconds between exercises in set
  restAfter: z.number().optional(),     // seconds after completing all rounds

  // For "activity" type
  activity: activitySchema.optional(),

  // For "rest" type
  restDuration: z.number().optional(),  // seconds

  // Randomization
  randomize: z.boolean().default(false),  // Shuffle exercise selection
  poolSize: z.number().optional(),        // Limit random pool size

  // Fixed variants (pre-built exercise sequences)
  fixedVariants: z.array(fixedVariantSchema).optional(),
  fixedVariantChance: z.number().min(0).max(1).optional(),  // 0-1, default 0.3
});

export type WorkoutSet = z.infer<typeof workoutSetSchema>;

// ============================================
// WORKOUT (Collection of sets)
// ============================================

export const workoutSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),

  // Organization
  routineId: z.string().optional(),     // Links to parent routine
  tags: z.array(z.string()),

  // Attribution
  creator: z.string().optional(),       // "@actionjacquelyn", "Reddit BWF"
  source: z.string().optional(),        // "100-Reps Barre Leg Challenge", "RRR"
  sourceUrl: z.string().optional(),     // link to original

  // Metadata
  difficulty: difficultySchema.optional(),
  estimatedDuration: z.number().optional(),  // minutes
  equipment: z.array(z.string()).optional(), // Required equipment summary

  // The workout content
  sets: z.array(workoutSetSchema),

  // Guidance
  tips: z.array(z.string()).optional(),

  // Fixed alternatives (randomly select from other workouts)
  fixedAlternatives: z.array(z.string()).optional(),  // Array of workout IDs
  fixedAlternativeChance: z.number().min(0).max(1).optional(),  // 0-1, default 0.4
});

export type Workout = z.infer<typeof workoutSchema>;

// ============================================
// ROUTINE (Meta category grouping workouts)
// ============================================

export const routineDefaultsSchema = z.object({
  duration: z.number().optional(),      // default target minutes
  difficulty: difficultySchema.optional(),
  equipment: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  // Default criteria for random generation
  criteria: criteriaSchema.optional(),
});

export type RoutineDefaults = z.infer<typeof routineDefaultsSchema>;

export const routineSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),              // "Barre", "Morning Wakeup", "Gym"
  description: z.string().optional(),
  icon: z.string().optional(),          // emoji or icon name
  color: z.string().optional(),         // hex color for UI

  // Default config for random workout generation
  defaults: routineDefaultsSchema.optional(),

  // Ordering/display
  sortOrder: z.number().optional(),
});

export type Routine = z.infer<typeof routineSchema>;

// ============================================
// PROGRESSION (exercise chains from easy to hard)
// ============================================

export const progressionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  exercises: z.array(z.string()),  // exercise IDs in order from easy to hard
});

export type Progression = z.infer<typeof progressionSchema>;

// ============================================
// PROGRAM DAY (single day in a program schedule)
// ============================================

export const programDayTypeSchema = z.enum([
  "workout",    // Perform a specific workout
  "rest",       // Rest day
  "activity",   // Non-exercise activity (Zone 2 cardio, walks, etc.)
  "choice",     // User picks from options (e.g., "OFF or Zone 2 Cardio")
]);

export type ProgramDayType = z.infer<typeof programDayTypeSchema>;

export const programDayOptionSchema = z.object({
  label: z.string(),
  type: z.enum(["rest", "workout", "activity"]),
  workoutId: z.string().optional(),
  activity: activitySchema.optional(),
});

export type ProgramDayOption = z.infer<typeof programDayOptionSchema>;

export const programDaySchema = z.object({
  day: z.number().int().positive(),       // Day number in the week (1-7)
  label: z.string().optional(),           // Display label: "UPPER A", "LOWER B", "OFF"
  type: programDayTypeSchema,

  // For type "workout"
  workoutId: z.string().optional(),       // References a Workout.id

  // For type "activity"
  activity: activitySchema.optional(),    // Inline activity (Zone 2 Cardio, etc.)

  // For type "choice" -- user picks one
  options: z.array(programDayOptionSchema).optional(),

  notes: z.string().optional(),
});

export type ProgramDay = z.infer<typeof programDaySchema>;

// ============================================
// PROGRAM (weekly training program)
// ============================================

export const programSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),

  // Attribution
  creator: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),

  // Program metadata
  frequency: z.number().int().positive().optional(), // Training days per week
  phase: z.string().optional(),           // "cutting", "bulking", "maintenance", "hypertrophy"
  durationWeeks: z.number().int().positive().optional(), // Program length (null = indefinite)
  difficulty: difficultySchema.optional(),
  equipment: z.array(z.string()).optional(),
  tags: z.array(z.string()),

  // The weekly schedule
  schedule: z.array(programDaySchema),

  // Guidance
  tips: z.array(z.string()).optional(),
  restGuidelines: z.string().optional(),
});

export type Program = z.infer<typeof programSchema>;

// ============================================
// CATALOGUE V2 (extends original with new types)
// ============================================

export interface CatalogueV2 {
  // From original
  exercises: Map<string, unknown>;      // Exercise type from original schemas
  progressions: Map<string, unknown>;   // ExerciseProgression from original

  // New v2 types
  workouts: Map<string, Workout>;
  routines: Map<string, Routine>;
  programs: Map<string, Program>;

  // Metadata
  meta: {
    types: string[];
    muscles: string[];
    equipment: string[];
    tags: string[];
  };
}
