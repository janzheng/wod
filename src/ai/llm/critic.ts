/**
 * Critic — post-composition LLM evaluation.
 * Evaluates whether a generated workout matches the user's request.
 */

import type { LLMConfig, WorkoutIntent, GeneratedWorkout, CritiqueResult } from "../types.ts";
import { extractJSON } from "./extract.ts";

function workoutSummary(workout: GeneratedWorkout): string {
  const lines: string[] = [];
  lines.push(`Name: ${workout.name}`);
  lines.push(`Pattern: ${workout.pattern ?? "custom"}`);
  lines.push(`Duration: ~${workout.estimatedDuration ?? "unknown"} min`);
  lines.push(`Equipment: ${workout.equipment?.join(", ") ?? "bodyweight"}`);
  lines.push(`Difficulty: ${workout.difficulty ?? "not specified"}`);
  for (const set of workout.sets) {
    const exNames = set.exercises.map(e => e.name).join(", ");
    lines.push(`  ${set.name ?? set.id} (${set.rounds}x): ${exNames}`);
  }
  return lines.join("\n");
}

function intentSummary(intent: WorkoutIntent): string {
  const parts: Record<string, unknown> = { mode: intent.mode };
  if (intent.duration) parts.duration = intent.duration;
  if (intent.muscles?.length) parts.muscles = intent.muscles;
  if (intent.equipment?.length) parts.equipment = intent.equipment;
  if (intent.excludeEquipment?.length) parts.excludeEquipment = intent.excludeEquipment;
  if (intent.excludeTags?.length) parts.excludeTags = intent.excludeTags;
  if (intent.difficulty) parts.difficulty = intent.difficulty;
  if (intent.type) parts.type = intent.type;
  if (intent.style) parts.style = intent.style;
  if (intent.goals?.length) parts.goals = intent.goals;
  if (intent.constraints?.length) parts.constraints = intent.constraints;
  return JSON.stringify(parts, null, 2);
}

const SYSTEM_PROMPT = `You evaluate generated workouts against user requests.

Score 1-5:
  5 = Perfect match — exactly what was asked for
  4 = Minor gaps (e.g., duration slightly off, missing one requested element)
  3 = Reasonable workout but missing some key elements
  2 = Significant mismatch with user request
  1 = Wrong workout entirely

Pass if score >= 3.

Check for:
- Requested muscles/body parts are represented in the exercises
- Requested equipment constraints are honored (including exclusions)
- Duration is roughly appropriate
- Difficulty matches request
- Style/type matches (barre, HIIT, yoga, etc.)
- Specific constraints like "no jumping", "apartment friendly" are respected

If the workout fails, suggest fixes as a partial WorkoutIntent JSON that could fix the issues.

Return ONLY a JSON object:
{
  "pass": true/false,
  "score": 1-5,
  "issues": ["list of problems, empty if pass"],
  "suggestedFixes": { partial WorkoutIntent overrides, omit if pass }
}`;

export async function critiqueWorkout(
  userPrompt: string,
  intent: WorkoutIntent,
  workout: GeneratedWorkout,
  config: LLMConfig,
): Promise<CritiqueResult> {
  try {
    const user = `USER REQUEST: "${userPrompt}"

PARSED INTENT:
${intentSummary(intent)}

GENERATED WORKOUT:
${workoutSummary(workout)}`;

    const result = await extractJSON<CritiqueResult>(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: user },
      ],
      config,
      1,
    );

    if (result && typeof result.pass === "boolean" && typeof result.score === "number") {
      return {
        pass: result.pass,
        score: result.score,
        issues: Array.isArray(result.issues) ? result.issues : [],
        suggestedFixes: result.suggestedFixes,
      };
    }

    return { pass: true, score: 3, issues: [] };
  } catch {
    return { pass: true, score: 3, issues: [] };
  }
}
