/**
 * Pattern Selector — LLM picks the best workout pattern for an intent.
 */

import type { LLMConfig, WorkoutIntent, PatternId } from "../types.ts";
import { patternsForLLM } from "../engine/patterns.ts";
import { extractJSON } from "./extract.ts";

interface PatternSelection {
  patternId: PatternId;
  reason?: string;
}

function buildSystemPrompt(): string {
  return `You are a workout pattern selector. Given a workout intent, pick the BEST matching pattern.

AVAILABLE PATTERNS:
${patternsForLLM()}

Return ONLY a JSON object:
{
  "patternId": "one-of-the-pattern-ids-above",
  "reason": "brief reason for the choice"
}`;
}

function intentSummary(intent: WorkoutIntent): string {
  const parts: string[] = [];
  if (intent.duration) parts.push(`${intent.duration} min`);
  if (intent.muscles?.length) parts.push(`muscles: ${intent.muscles.join(", ")}`);
  if (intent.equipment?.length) parts.push(`equipment: ${intent.equipment.join(", ")}`);
  if (intent.difficulty) parts.push(intent.difficulty);
  if (intent.type) parts.push(`type: ${intent.type}`);
  if (intent.style) parts.push(`style: ${intent.style}`);
  if (intent.goals?.length) parts.push(`goals: ${intent.goals.join(", ")}`);
  if (intent.constraints?.length) parts.push(`constraints: ${intent.constraints.join(", ")}`);
  return parts.join(", ") || "general workout";
}

export async function selectPattern(
  intent: WorkoutIntent,
  config: LLMConfig,
): Promise<PatternId> {
  const system = buildSystemPrompt();
  const user = `Select a workout pattern for: ${intentSummary(intent)}`;

  const result = await extractJSON<PatternSelection>(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    config,
  );

  if (result?.patternId) return result.patternId;

  // Fallback: heuristic
  if (intent.type === "yoga" || intent.type === "barre") return "flow";
  if (intent.style?.includes("circuit") || intent.style?.includes("cardio")) return "classic-circuit";
  if (intent.style?.includes("hiit") || intent.style?.includes("tabata")) return "tabata";
  return "block-training";
}
