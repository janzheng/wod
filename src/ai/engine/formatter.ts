/**
 * Workout Formatter — terminal (ANSI) and markdown output.
 */

import type { GeneratedWorkout, GeneratedSet } from "../types.ts";

const BOLD = "\x1b[1m";
const DIM = "\x1b[90m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function formatReps(reps?: string | number, duration?: number): string {
  if (duration) return `${duration}s`;
  if (reps === undefined) return "";
  if (typeof reps === "number") return `${reps} reps`;
  return `${reps} reps`;
}

function formatSet(set: GeneratedSet, idx: number): string {
  const lines: string[] = [];
  const header = set.name ?? `Set ${idx + 1}`;
  const roundsLabel = set.rounds > 1 ? ` ${DIM}x ${set.rounds} rounds${RESET}` : "";
  lines.push(`\n  ${CYAN}${BOLD}${header}${RESET}${roundsLabel}`);

  for (const ex of set.exercises) {
    const rep = formatReps(ex.reps, ex.duration);
    const notes = ex.notes ? ` ${DIM}(${ex.notes})${RESET}` : "";
    lines.push(`    ${GREEN}*${RESET} ${ex.name} ${YELLOW}${rep}${RESET}${notes}`);
  }

  if (set.restBetween) {
    lines.push(`    ${DIM}Rest between: ${set.restBetween}s${RESET}`);
  }
  if (set.restAfter) {
    lines.push(`    ${DIM}Rest after: ${set.restAfter}s${RESET}`);
  }

  return lines.join("\n");
}

export function formatTerminal(workout: GeneratedWorkout): string {
  const lines: string[] = [];

  lines.push(`\n${BOLD}=== ${workout.name} ===${RESET}`);
  if (workout.description) lines.push(`${DIM}${workout.description}${RESET}`);

  const meta: string[] = [];
  if (workout.estimatedDuration) meta.push(`~${workout.estimatedDuration} min`);
  if (workout.difficulty) meta.push(workout.difficulty);
  if (workout.pattern) meta.push(workout.pattern);
  if (workout.sourceTemplate) meta.push(`based on: ${workout.sourceTemplate}`);
  if (meta.length) lines.push(`${DIM}${meta.join(" | ")}${RESET}`);

  if (workout.equipment?.length) {
    lines.push(`${DIM}Equipment: ${workout.equipment.join(", ")}${RESET}`);
  }

  for (let i = 0; i < workout.sets.length; i++) {
    lines.push(formatSet(workout.sets[i], i));
  }

  if (workout.tips?.length) {
    lines.push(`\n  ${BOLD}Tips:${RESET}`);
    for (const tip of workout.tips) {
      lines.push(`    ${DIM}> ${tip}${RESET}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

export function formatMarkdown(workout: GeneratedWorkout): string {
  const lines: string[] = [];

  lines.push(`# ${workout.name}\n`);
  if (workout.description) lines.push(`${workout.description}\n`);

  const meta: string[] = [];
  if (workout.estimatedDuration) meta.push(`**Duration:** ~${workout.estimatedDuration} min`);
  if (workout.difficulty) meta.push(`**Difficulty:** ${workout.difficulty}`);
  if (workout.equipment?.length) meta.push(`**Equipment:** ${workout.equipment.join(", ")}`);
  if (meta.length) lines.push(meta.join(" | ") + "\n");

  for (const set of workout.sets) {
    const roundsLabel = set.rounds > 1 ? ` (${set.rounds} rounds)` : "";
    lines.push(`## ${set.name ?? set.id}${roundsLabel}\n`);

    for (const ex of set.exercises) {
      const rep = formatReps(ex.reps, ex.duration);
      const notes = ex.notes ? ` *(${ex.notes})*` : "";
      lines.push(`- **${ex.name}** — ${rep}${notes}`);
    }

    if (set.restBetween) lines.push(`\n*Rest between: ${set.restBetween}s*`);
    if (set.restAfter) lines.push(`*Rest after: ${set.restAfter}s*`);
    lines.push("");
  }

  if (workout.tips?.length) {
    lines.push("## Tips\n");
    for (const tip of workout.tips) {
      lines.push(`- ${tip}`);
    }
  }

  return lines.join("\n");
}

export function formatJson(workout: GeneratedWorkout): string {
  return JSON.stringify(workout, null, 2);
}
