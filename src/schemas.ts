import { z } from "zod";

// Challenge metadata for exercises that belong to a specific program
export const challengeMetaSchema = z.object({
  id: z.string(), // e.g., "100-reps-barre-leg-challenge"
  name: z.string(), // e.g., "100-Reps Barre Sculpted Leg Challenge"
  creator: z.string().optional(), // e.g., "@actionjacquelyn"
  day: z.number().int().positive(), // day number within the challenge
});

export type ChallengeMeta = z.infer<typeof challengeMetaSchema>;

// Media item schema - supports images, videos, links, YouTube, tweets, etc.
export const mediaItemSchema = z.object({
  type: z.enum(["image", "video", "link", "youtube", "tweet"]), // media type
  value: z.string(), // URL or path (e.g., "/images/exercise.png", "https://youtube.com/...", "https://twitter.com/...")
  caption: z.string().optional(), // optional caption or description
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

// Exercise schema
export const exerciseSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  category: z.string().optional(), // movement pattern category: chest, back-vertical-pull, legs-quads, etc.
  type: z.string(), // weights, plyo, yoga, cardio, etc.
  muscles: z.array(z.string()), // chest, back, shoulders, etc.
  equipment: z.array(z.string()), // barbell, dumbbell, bodyweight, etc.
  tags: z.array(z.string()), // compound, isolation, push, pull, etc.
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  duration: z.number().positive().optional(), // seconds
  description: z.string().optional(), // how to perform the exercise
  challenge: challengeMetaSchema.optional(), // optional challenge metadata
  media: z.array(mediaItemSchema).optional(), // optional media items (images, videos, links)
});

export type Exercise = z.infer<typeof exerciseSchema>;

// Workout exercise entry
export const workoutExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().positive().optional(),
  reps: z.union([z.number().int().positive(), z.literal("max")]).optional(),
  duration: z.number().positive().optional(), // seconds
  rest: z.number().positive().optional(), // seconds
});

export type WorkoutExercise = z.infer<typeof workoutExerciseSchema>;

// Workout schema (flat list, no sections)
export const workoutSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  duration: z.number().positive().optional(), // estimated minutes
  tags: z.array(z.string()),
  exercises: z.array(workoutExerciseSchema),
});

export type Workout = z.infer<typeof workoutSchema>;

// Catalogue structure
export interface Catalogue {
  exercises: Map<string, Exercise>;
  workouts: Map<string, Workout>;
  progressions: Map<string, ExerciseProgression>;
  meta: {
    types: string[];
    muscles: string[];
    equipment: string[];
    tags: string[];
  };
}

// ============================================
// Format Template System
// ============================================

// Slot criteria for matching exercises
export const slotCriteriaSchema = z.object({
  exerciseId: z.string().optional(), // Specific exercise (highest priority)
  matchType: z.string().optional(), // Exercise type filter
  matchTypes: z.array(z.string()).optional(), // Multiple types (OR)
  matchMuscles: z.array(z.string()).optional(), // Any of these muscles (OR)
  matchTags: z.array(z.string()).optional(), // Any of these tags (OR)
  matchEquipment: z.array(z.string()).optional(), // Any of this equipment (OR)
  excludeTags: z.array(z.string()).optional(), // Exclude these tags
  excludeEquipment: z.array(z.string()).optional(), // Exclude these
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

export type SlotCriteria = z.infer<typeof slotCriteriaSchema>;

// Tempo notation: E-P1-C-P2 (Eccentric-Pause1-Concentric-Pause2)
// Example: "3-1-2-0" = 3s down, 1s pause, 2s up, no pause at top
// "10X0" in RRR notation = "1-0-X-0" (1s down, explosive up)
export const tempoSchema = z.string().regex(
  /^(\d+|X)-(\d+|X)-(\d+|X)-(\d+|X)$/,
  "Tempo must be format: E-P1-C-P2 (e.g., 1-0-X-0 or 3-1-2-0). Use X for explosive."
).optional();

// Rep range for progressive exercises (e.g., "5-8" means 5 to 8 reps)
export const repRangeSchema = z.union([
  z.number().int().positive(),
  z.literal("max"),
  z.string().regex(/^\d+-\d+$/, "Rep range format: min-max (e.g., 5-8)"),
  z.string().regex(/^\d+\+$/, "Min reps format: n+ (e.g., 10+)"),
]);

// Exercise slot within a section
export const exerciseSlotSchema = z.object({
  id: z.string(),
  name: z.string().optional(), // "Push-up Variation", "Plie Series"
  criteria: slotCriteriaSchema,
  duration: z.number().positive().optional(), // seconds
  sets: z.number().int().positive().optional(),
  reps: repRangeSchema.optional(),
  rest: z.number().positive().optional(), // seconds after this slot
  tempo: tempoSchema, // Optional tempo override
  notes: z.string().optional(), // Instructions or comments
  progressionId: z.string().optional(), // Link to a progression sequence
});

export type ExerciseSlot = z.infer<typeof exerciseSlotSchema>;

// Exercise group for paired/triplet/giant-set training
// Allows grouping exercises together with shared rest patterns
export const exerciseGroupSchema = z.object({
  id: z.string(),
  name: z.string().optional(), // "Pull-up & Squat Pair"
  type: z.enum(["pair", "triplet", "giant-set"]),
  slots: z.array(exerciseSlotSchema),
  sets: z.number().int().positive().optional(), // Sets for the entire group (default 3)
  restBetweenExercises: z.number().positive().optional(), // Rest between exercises in group (default 90s)
  restAfterGroup: z.number().positive().optional(), // Rest after completing all exercises (default 90s)
  notes: z.string().optional(), // Instructions for the group
});

export type ExerciseGroup = z.infer<typeof exerciseGroupSchema>;

// A section item can be either a single slot or a group
export const sectionItemSchema = z.union([exerciseSlotSchema, exerciseGroupSchema]);

export type SectionItem = z.infer<typeof sectionItemSchema>;

// Randomization variance levels
export const varianceSchema = z.enum(["none", "low", "medium", "high"]);

export type Variance = z.infer<typeof varianceSchema>;

// Section within a format
export const formatSectionSchema = z.object({
  id: z.string(),
  name: z.string(), // "Floor Circuit", "Barre Work"
  type: z.enum(["warmup", "circuit", "strength", "barre", "yoga", "cooldown", "custom"]),

  // Timing
  duration: z.number().positive().optional(), // target minutes

  // Circuit-specific
  rounds: z.number().int().positive().optional(),
  roundRest: z.number().positive().optional(), // rest between rounds

  // Randomization control
  variance: varianceSchema.default("medium"), // How much to randomize

  // Exercise slots (backwards compatible - simple list)
  slots: z.array(exerciseSlotSchema).optional(),

  // Exercise items (new - supports both slots and groups)
  items: z.array(sectionItemSchema).optional(),

  // Section notes/instructions
  notes: z.string().optional(),

  // Transition
  restAfter: z.number().positive().optional(), // rest after this section
});

// Exercise progression - links exercises from easier to harder
export const exerciseProgressionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(), // "Pull-up Progression"
  description: z.string().optional(),
  exercises: z.array(z.string()), // exerciseIds in order from beginner to advanced
});

export type ExerciseProgression = z.infer<typeof exerciseProgressionSchema>;

export type FormatSection = z.infer<typeof formatSectionSchema>;

// Complete format template
export const formatTemplateSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  tips: z.array(z.string()).optional(), // helpful pointers for the workout
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  estimatedDuration: z.number().positive(), // minutes
  equipment: z.array(z.string()).optional(), // required equipment
  tags: z.array(z.string()),
  sections: z.array(formatSectionSchema),
});

export type FormatTemplate = z.infer<typeof formatTemplateSchema>;
