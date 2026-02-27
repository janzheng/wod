/**
 * WOD-AI Type Definitions
 *
 * Adapted from wod-ai project. Uses .passthrough() on exercise schema
 * to accept tallinn's extra fields (category, challenge, media, source).
 */

import { z } from "zod";

// ============================================
// EXERCISE
// ============================================

export const exerciseSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  type: z.string(),
  muscles: z.array(z.string()),
  equipment: z.array(z.string()),
  tags: z.array(z.string()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  duration: z.number().positive().optional(),
  description: z.string().optional(),
  // Accept tallinn's extra fields
  category: z.string().optional(),
}).passthrough();

export type Exercise = z.infer<typeof exerciseSchema>;

// ============================================
// CRITERIA (exercise matching)
// ============================================

export const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const criteriaSchema = z.object({
  exerciseId: z.string().optional(),
  progression: z.string().optional(),
  types: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  muscles: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  excludeTags: z.array(z.string()).optional(),
  excludeEquipment: z.array(z.string()).optional(),
  difficulty: difficultySchema.optional(),
});

export type Criteria = z.infer<typeof criteriaSchema>;

// ============================================
// REPS + TEMPO
// ============================================

export const repsSchema = z.union([
  z.number().int().positive(),
  z.literal("max"),
  z.string().regex(/^\d+-\d+$/),
  z.string().regex(/^\d+\+$/),
  z.string().regex(/^\d+-\d+.*$/),
  z.string().regex(/^\d+.*$/),
]);
export type Reps = z.infer<typeof repsSchema>;

export const tempoSchema = z.string().regex(
  /^(\d+|X)-(\d+|X)-(\d+|X)-(\d+|X)$/,
).optional();
export type Tempo = z.infer<typeof tempoSchema>;

// ============================================
// SET EXERCISE
// ============================================

export const setExerciseSchema = z.object({
  criteria: criteriaSchema.optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  reps: repsSchema.optional(),
  duration: z.union([z.number(), z.string()]).optional(),
  tempo: tempoSchema,
  notes: z.string().optional(),
  progressionId: z.string().optional(),
});

export type SetExercise = z.infer<typeof setExerciseSchema>;

// ============================================
// ACTIVITY (non-exercise sets)
// ============================================

export const activitySchema = z.object({
  name: z.string(),
  duration: z.number().optional(),
  distance: z.string().optional(),
  intensity: z.string().optional(),
  notes: z.string().optional(),
});

export type Activity = z.infer<typeof activitySchema>;

// ============================================
// SET TYPE + FIXED VARIANTS
// ============================================

export const setTypeSchema = z.enum(["exercises", "rest", "activity", "superset"]);
export type SetType = z.infer<typeof setTypeSchema>;

export const fixedVariantSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  exercises: z.array(setExerciseSchema),
});
export type FixedVariant = z.infer<typeof fixedVariantSchema>;

// ============================================
// WORKOUT SET
// ============================================

export const workoutSetSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: setTypeSchema,
  exercises: z.array(setExerciseSchema).optional(),
  rounds: z.number().int().positive().default(1),
  restBetween: z.number().optional(),
  restAfter: z.number().optional(),
  activity: activitySchema.optional(),
  restDuration: z.number().optional(),
  randomize: z.boolean().default(false),
  poolSize: z.number().optional(),
  fixedVariants: z.array(fixedVariantSchema).optional(),
  fixedVariantChance: z.number().min(0).max(1).optional(),
});

export type WorkoutSet = z.infer<typeof workoutSetSchema>;

// ============================================
// WORKOUT
// ============================================

export const workoutSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  routineId: z.string().optional(),
  tags: z.array(z.string()),
  creator: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
  difficulty: difficultySchema.optional(),
  estimatedDuration: z.number().optional(),
  equipment: z.array(z.string()).optional(),
  sets: z.array(workoutSetSchema),
  tips: z.array(z.string()).optional(),
  fixedAlternatives: z.array(z.string()).optional(),
  fixedAlternativeChance: z.number().min(0).max(1).optional(),
});

export type Workout = z.infer<typeof workoutSchema>;

// ============================================
// ROUTINE
// ============================================

export const routineSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  defaults: z.object({
    duration: z.number().optional(),
    difficulty: difficultySchema.optional(),
    equipment: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  sortOrder: z.number().optional(),
});

export type Routine = z.infer<typeof routineSchema>;

// ============================================
// PROGRESSION
// ============================================

export const progressionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  exercises: z.array(z.string()),
});

export type Progression = z.infer<typeof progressionSchema>;

// ============================================
// LOADED DATA (from loader)
// ============================================

export interface LoadedData {
  exercises: Map<string, Exercise>;
  workouts: Map<string, Workout>;
  routines: Map<string, Routine>;
  progressions: Map<string, Progression>;
}

// ============================================
// WOD-AI SPECIFIC TYPES
// ============================================

export interface WorkoutIntent {
  mode: "freeform" | "template";
  // Freeform fields
  duration?: number;
  muscles?: string[];
  equipment?: string[];
  excludeEquipment?: string[];
  excludeTags?: string[];
  difficulty?: Difficulty;
  type?: string;
  style?: string;
  goals?: string[];
  constraints?: string[];
  // Template fields
  templateQuery?: string;
  modifications?: {
    harder?: boolean;
    easier?: boolean;
    longer?: boolean;
    shorter?: boolean;
    moreFocus?: string[];
    lessFocus?: string[];
  };
}

export type PatternId =
  | "block-training"
  | "classic-circuit"
  | "superset-pairs"
  | "emom"
  | "amrap"
  | "tabata"
  | "ladder"
  | "flow";

export interface PhaseTemplate {
  name: string;
  type: "warmup" | "work" | "cooldown";
  sets: number;
  exercisesPerSet: number;
  rounds: number;
  restBetween: number;
  restAfter: number;
  durationPerExercise?: number;
  criteriaHints?: Partial<Criteria>;
}

export interface WorkoutPattern {
  id: PatternId;
  name: string;
  description: string;
  phases: PhaseTemplate[];
  suitableFor: string[];
  durationRange: [number, number];
}

export interface GeneratedExercise {
  name: string;
  id: string;
  reps?: string | number;
  duration?: number;
  tempo?: string;
  notes?: string;
  description?: string;
}

export interface GeneratedSet {
  id: string;
  name?: string;
  type: string;
  rounds: number;
  exercises: GeneratedExercise[];
  restBetween?: number;
  restAfter?: number;
  activity?: Activity;
  restDuration?: number;
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  description?: string;
  routineId?: string;
  difficulty?: string;
  estimatedDuration?: number;
  equipment?: string[];
  sets: GeneratedSet[];
  tips?: string[];
  pattern?: PatternId;
  sourceTemplate?: string;
}

// ============================================
// LLM TYPES
// ============================================

export interface LLMConfig {
  baseUrl: string;
  apiKey?: string;
  model: string;
  temperature?: number;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Vocabulary {
  types: string[];
  muscles: string[];
  equipment: string[];
  tags: string[];
  difficulties: string[];
  categories: string[];
}

// ============================================
// CONVERSATION + SESSION TYPES
// ============================================

export interface ConversationTurn {
  role: "user" | "assistant";
  prompt: string;
  intent?: WorkoutIntent;
  workout?: GeneratedWorkout;
  critique?: CritiqueResult;
  timestamp: number;
}

export interface CritiqueResult {
  pass: boolean;
  score: number;
  issues: string[];
  suggestedFixes?: Partial<WorkoutIntent>;
}

export interface ConversationSession {
  id: string;
  turns: ConversationTurn[];
  createdAt: number;
  lastActiveAt: number;
}

export interface ConversationGenerateOptions {
  prompt: string;
  session?: ConversationSession;
  enableCritic?: boolean;
  maxCriticRetries?: number;
}

export interface ConversationGenerateResult {
  workout: GeneratedWorkout;
  intent: WorkoutIntent;
  critique?: CritiqueResult;
  session: ConversationSession;
}
