/**
 * Conversation-aware intent parser.
 * Given previous turns + a new user message, produces a WorkoutIntent
 * that incorporates the user's refinements into the previous intent.
 */

import type {
  LLMConfig,
  WorkoutIntent,
  Vocabulary,
  ConversationTurn,
} from "../types.ts";
import { extractJSON } from "./extract.ts";

function buildContextBlock(turns: ConversationTurn[]): string {
  const lines: string[] = [];

  for (const turn of turns) {
    if (turn.role === "user") {
      lines.push(`User: "${turn.prompt}"`);
      if (turn.intent) {
        const parts: string[] = [];
        if (turn.intent.duration) parts.push(`${turn.intent.duration}min`);
        if (turn.intent.muscles?.length) parts.push(`muscles: ${turn.intent.muscles.join(", ")}`);
        if (turn.intent.equipment?.length) parts.push(`equipment: ${turn.intent.equipment.join(", ")}`);
        if (turn.intent.difficulty) parts.push(turn.intent.difficulty);
        if (turn.intent.type) parts.push(`type: ${turn.intent.type}`);
        if (turn.intent.style) parts.push(`style: ${turn.intent.style}`);
        if (parts.length) lines.push(`  -> Intent: ${parts.join(", ")}`);
      }
    } else if (turn.role === "assistant" && turn.workout) {
      const w = turn.workout;
      const exCount = w.sets.reduce((n, s) => n + s.exercises.length, 0);
      lines.push(`Generated: "${w.name}" — ${w.sets.length} sets, ${exCount} exercises, ~${w.estimatedDuration ?? "?"}min`);
      if (turn.critique && !turn.critique.pass) {
        lines.push(`  Critic issues: ${turn.critique.issues.join("; ")}`);
      }
    }
  }

  return lines.join("\n");
}

function buildSystemPrompt(
  vocab: Vocabulary,
  templateNames: string[],
  context: string,
): string {
  return `You are a workout intent parser that refines previous requests based on new user input.

CONVERSATION SO FAR:
${context}

The user is now giving a FOLLOW-UP instruction. Based on the conversation context, produce a COMPLETE WorkoutIntent JSON that incorporates their changes into the previous intent.

RULES:
- If the user says "make it harder" or "more challenging" -> keep previous muscles/equipment, increase difficulty or add modifications.harder
- If the user says "add more core" -> add "core" and "abs" to muscles, keep everything else
- If the user says "swap the exercises" -> keep same intent but the engine will re-roll
- If the user says "no barbell" -> add "barbell" to excludeEquipment
- If the user's message is a completely NEW request (unrelated to previous), start fresh
- Always output a COMPLETE intent, not a diff

DETECT TWO MODES:
1. "template" mode — if the user says "like", "similar to", "based on" an existing workout name
2. "freeform" mode — for everything else (default)

VALID FIELD VALUES:
- muscles: ${vocab.muscles.slice(0, 30).join(", ")}
- equipment: ${vocab.equipment.join(", ")}
- types: ${vocab.types.join(", ")}
- difficulties: ${vocab.difficulties.join(", ")}

KNOWN TEMPLATES:
${templateNames.slice(0, 30).join(", ")}

Return ONLY a JSON object with these fields (omit fields not specified):
{
  "mode": "freeform" or "template",
  "duration": number (minutes),
  "muscles": ["muscle1", "muscle2"],
  "equipment": ["equip1"],
  "excludeEquipment": ["equip1"],
  "excludeTags": ["tag1"],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "type": "weights" | "calisthenics" | etc.,
  "style": "strength" | "cardio" | etc.,
  "goals": ["build muscle", "burn fat"],
  "constraints": ["no jumping"],
  "templateQuery": "name" (only for template mode),
  "modifications": { "harder": true, "easier": true, "longer": true, "shorter": true, "moreFocus": ["core"], "lessFocus": ["arms"] }
}`;
}

export async function refineIntent(
  userMessage: string,
  previousTurns: ConversationTurn[],
  vocab: Vocabulary,
  templateNames: string[],
  config: LLMConfig,
): Promise<WorkoutIntent> {
  const context = buildContextBlock(previousTurns);
  const system = buildSystemPrompt(vocab, templateNames, context);

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
