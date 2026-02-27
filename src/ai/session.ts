/**
 * Session Management — pure functions for conversation state.
 * No I/O, no side effects. All functions return new objects.
 */

import type {
  ConversationSession,
  ConversationTurn,
  WorkoutIntent,
  GeneratedWorkout,
  CritiqueResult,
} from "./types.ts";

export function createSession(): ConversationSession {
  return {
    id: `wod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    turns: [],
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
}

export function addUserTurn(
  session: ConversationSession,
  prompt: string,
  intent: WorkoutIntent,
): ConversationSession {
  const turn: ConversationTurn = {
    role: "user",
    prompt,
    intent,
    timestamp: Date.now(),
  };
  return {
    ...session,
    turns: [...session.turns, turn],
    lastActiveAt: Date.now(),
  };
}

export function addAssistantTurn(
  session: ConversationSession,
  workout: GeneratedWorkout,
  critique?: CritiqueResult,
): ConversationSession {
  const turn: ConversationTurn = {
    role: "assistant",
    prompt: workout.name,
    workout,
    critique,
    timestamp: Date.now(),
  };
  return {
    ...session,
    turns: [...session.turns, turn],
    lastActiveAt: Date.now(),
  };
}

export function getRecentTurns(
  session: ConversationSession,
  maxTurns = 6,
): ConversationTurn[] {
  return session.turns.slice(-maxTurns);
}

export function getLastIntent(session: ConversationSession): WorkoutIntent | undefined {
  for (let i = session.turns.length - 1; i >= 0; i--) {
    if (session.turns[i].role === "user" && session.turns[i].intent) {
      return session.turns[i].intent;
    }
  }
  return undefined;
}

export function getLastWorkout(session: ConversationSession): GeneratedWorkout | undefined {
  for (let i = session.turns.length - 1; i >= 0; i--) {
    if (session.turns[i].role === "assistant" && session.turns[i].workout) {
      return session.turns[i].workout;
    }
  }
  return undefined;
}
