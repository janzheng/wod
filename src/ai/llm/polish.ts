/**
 * Polish — LLM generates name, tips, and description for a completed workout.
 */

import type { LLMConfig, GeneratedWorkout } from "../types.ts";
import { extractJSON } from "./extract.ts";

interface PolishResult {
  name: string;
  description?: string;
  tips?: string[];
}

function workoutSummary(workout: GeneratedWorkout): string {
  const lines: string[] = [];
  lines.push(`Pattern: ${workout.pattern ?? "custom"}`);
  lines.push(`Duration: ~${workout.estimatedDuration} min`);
  lines.push(`Equipment: ${workout.equipment?.join(", ") ?? "bodyweight"}`);
  lines.push(`Sets:`);
  for (const set of workout.sets) {
    const exNames = set.exercises.map(e => e.name).join(", ");
    lines.push(`  ${set.name} (${set.rounds}x): ${exNames}`);
  }
  return lines.join("\n");
}

export async function polishWorkout(
  workout: GeneratedWorkout,
  config: LLMConfig,
): Promise<GeneratedWorkout> {
  const system = `You are a fitness coach. Given a generated workout summary, provide:
1. A catchy, descriptive name (5 words max)
2. A one-sentence description
3. 3-5 practical coaching tips

Return ONLY a JSON object:
{
  "name": "Short Catchy Name",
  "description": "One sentence about the workout",
  "tips": ["tip1", "tip2", "tip3"]
}`;

  const result = await extractJSON<PolishResult>(
    [
      { role: "system", content: system },
      { role: "user", content: workoutSummary(workout) },
    ],
    config,
  );

  if (result) {
    workout.name = result.name ?? workout.name;
    workout.description = result.description;
    workout.tips = result.tips;
  }

  return workout;
}
