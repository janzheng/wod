/**
 * Intent Parser — natural language -> WorkoutIntent.
 * Detects both freeform and template-inspired modes.
 */

import type { LLMConfig, WorkoutIntent, Vocabulary } from "../types.ts";
import { extractJSON } from "./extract.ts";

function buildSystemPrompt(vocab: Vocabulary, templateNames: string[]): string {
  return `You are a workout intent parser. Given a user's natural language request, extract structured workout parameters as JSON.

DETECT TWO MODES:
1. "template" mode — if the user says "like", "similar to", "based on" an existing workout name
2. "freeform" mode — for everything else (default)

VALID FIELD VALUES:
- muscles: ${vocab.muscles.slice(0, 30).join(", ")}
- equipment: ${vocab.equipment.join(", ")}
- types: ${vocab.types.join(", ")}
- difficulties: ${vocab.difficulties.join(", ")}
- styles: strength, cardio, hiit, conditioning, muscle-building, flexibility, mobility, recovery

KNOWN WORKOUT TEMPLATES (for template mode):
${templateNames.slice(0, 30).join(", ")}

Return ONLY a JSON object with these fields (omit fields that aren't specified):
{
  "mode": "freeform" or "template",
  "duration": number (minutes, if mentioned),
  "muscles": ["muscle1", "muscle2"],
  "equipment": ["equip1"],
  "excludeEquipment": ["equip1"],
  "excludeTags": ["tag1"],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "type": "weights" | "calisthenics" | etc.,
  "style": "strength" | "cardio" | etc.,
  "goals": ["build muscle", "burn fat"],
  "constraints": ["no jumping", "apartment friendly"],
  "templateQuery": "morning wakeup" (only for template mode),
  "modifications": {
    "harder": true/false,
    "easier": true/false,
    "longer": true/false,
    "shorter": true/false,
    "moreFocus": ["core"],
    "lessFocus": ["arms"]
  }
}`;
}

export async function parseIntent(
  userMessage: string,
  vocab: Vocabulary,
  templateNames: string[],
  config: LLMConfig,
): Promise<WorkoutIntent> {
  const system = buildSystemPrompt(vocab, templateNames);

  const result = await extractJSON<WorkoutIntent>(
    [
      { role: "system", content: system },
      { role: "user", content: userMessage },
    ],
    config,
  );

  if (!result) {
    return { mode: "freeform" };
  }

  if (!result.mode) result.mode = "freeform";

  return result;
}
