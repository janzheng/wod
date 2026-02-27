/**
 * WOD-AI — main pipeline.
 * Orchestrates: intent -> pattern -> compose/reroll -> polish.
 * Supports both stateless generation and conversation-aware chat.
 */

import type {
  LLMConfig,
  GeneratedWorkout,
  LoadedData,
  WorkoutIntent,
  ConversationGenerateOptions,
  ConversationGenerateResult,
} from "./types.ts";
import { loadData } from "./engine/loader.ts";
import { ExerciseIndex } from "./engine/index.ts";
import { getPattern } from "./engine/patterns.ts";
import { composeWorkout } from "./engine/composer.ts";
import { findTemplate, rerollTemplate } from "./engine/template-matcher.ts";
import { parseIntent } from "./llm/intent.ts";
import { selectPattern } from "./llm/planner.ts";
import { polishWorkout } from "./llm/polish.ts";
import { critiqueWorkout } from "./llm/critic.ts";
import { refineIntent } from "./llm/refine-intent.ts";
import { createSession, addUserTurn, addAssistantTurn, getRecentTurns } from "./session.ts";

export { loadData } from "./engine/loader.ts";
export { ExerciseIndex } from "./engine/index.ts";
export { formatTerminal, formatMarkdown, formatJson } from "./engine/formatter.ts";
export { getConfig, PRESETS } from "./llm/provider.ts";
export { listPatterns } from "./engine/patterns.ts";
export { findTemplate, findTemplates, rerollTemplate } from "./engine/template-matcher.ts";
export { createSession, getRecentTurns, getLastIntent, getLastWorkout } from "./session.ts";
export type {
  ConversationSession,
  ConversationTurn,
  CritiqueResult,
  ConversationGenerateOptions,
  ConversationGenerateResult,
} from "./types.ts";

export interface WodAI {
  data: LoadedData;
  index: ExerciseIndex;
  config: LLMConfig;
  generate(prompt: string): Promise<GeneratedWorkout>;
  generateFromIntent(intent: WorkoutIntent): Promise<GeneratedWorkout>;
  chat(options: ConversationGenerateOptions): Promise<ConversationGenerateResult>;
}

export async function createWodAI(dataDir: string, config: LLMConfig): Promise<WodAI> {
  const data = await loadData(dataDir);
  const index = new ExerciseIndex(data.exercises);

  const vocab = index.getVocabulary();
  const templateNames = Array.from(data.workouts.values()).map(w => w.name);

  async function generate(prompt: string): Promise<GeneratedWorkout> {
    const intent = await parseIntent(prompt, vocab, templateNames, config);
    return generateFromIntent(intent);
  }

  async function generateFromIntent(intent: WorkoutIntent): Promise<GeneratedWorkout> {
    let workout: GeneratedWorkout;

    if (intent.mode === "template" && intent.templateQuery) {
      const template = findTemplate(data.workouts, intent.templateQuery);
      if (template) {
        workout = rerollTemplate(template, index, data.progressions, intent.modifications);
      } else {
        intent.mode = "freeform";
        const patternId = await selectPattern(intent, config);
        const pattern = getPattern(patternId) ?? getPattern("classic-circuit")!;
        workout = composeWorkout(intent, pattern, index, data.progressions);
      }
    } else {
      const patternId = await selectPattern(intent, config);
      const pattern = getPattern(patternId) ?? getPattern("classic-circuit")!;
      workout = composeWorkout(intent, pattern, index, data.progressions);
    }

    return workout;
  }

  async function chat(options: ConversationGenerateOptions): Promise<ConversationGenerateResult> {
    let session = options.session ?? createSession();
    const enableCritic = options.enableCritic ?? true;
    const maxRetries = options.maxCriticRetries ?? 1;

    const recentTurns = getRecentTurns(session);
    const intent = recentTurns.length > 0
      ? await refineIntent(options.prompt, recentTurns, vocab, templateNames, config)
      : await parseIntent(options.prompt, vocab, templateNames, config);

    session = addUserTurn(session, options.prompt, intent);

    let workout = await generateFromIntent(intent);

    let critique = undefined;
    if (enableCritic) {
      critique = await critiqueWorkout(options.prompt, intent, workout, config);

      if (!critique.pass && maxRetries > 0 && critique.suggestedFixes) {
        const refinedIntent: WorkoutIntent = { ...intent, ...critique.suggestedFixes };
        workout = await generateFromIntent(refinedIntent);
        critique = await critiqueWorkout(options.prompt, refinedIntent, workout, config);
      }
    }

    workout = await polishWorkout(workout, config);

    session = addAssistantTurn(session, workout, critique);

    return { workout, intent, critique, session };
  }

  return { data, index, config, generate, generateFromIntent, chat };
}
