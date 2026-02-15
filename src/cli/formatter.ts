import type { GeneratedWorkout, GeneratedSet, GeneratedExercise, ExerciseLegend } from "./generator.ts";

function wrapText(text: string, maxWidth: number, indent: string): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = indent;

  for (const word of words) {
    if (currentLine.length + word.length + 1 > maxWidth) {
      lines.push(currentLine);
      currentLine = indent + word;
    } else {
      currentLine += (currentLine === indent ? "" : " ") + word;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  return lines;
}

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  return `${seconds}s`;
}

function formatExercise(ex: GeneratedExercise, index: number): string {
  let line = `    ${index + 1}. ${ex.name}`;

  if (ex.reps) {
    line += ` - ${ex.reps} reps`;
  } else if (ex.duration) {
    line += ` - ${formatDuration(ex.duration)}`;
  }

  if (ex.tempo) {
    line += ` @${ex.tempo}`;
  }

  if (ex.notes) {
    line += ` (${ex.notes})`;
  }

  return line;
}

function formatSet(set: GeneratedSet): string {
  const lines: string[] = [];

  // Set header
  const roundsStr = set.rounds > 1 ? ` (${set.rounds} rounds)` : "";
  lines.push(`\n  [${set.name || set.id}]${roundsStr}`);

  if (set.type === "exercises" || set.type === "superset") {
    for (let i = 0; i < set.exercises.length; i++) {
      lines.push(formatExercise(set.exercises[i], i));
    }

    if (set.restBetween) {
      lines.push(`    Rest between: ${formatDuration(set.restBetween)}`);
    }
  } else if (set.type === "activity" && set.activity) {
    const act = set.activity;
    lines.push(`    ${act.name}`);
    if (act.duration) lines.push(`    Duration: ${act.duration} min`);
    if (act.distance) lines.push(`    Distance: ${act.distance}`);
    if (act.intensity) lines.push(`    Intensity: ${act.intensity}`);
    if (act.notes) lines.push(`    ${act.notes}`);
  } else if (set.type === "rest" && set.restDuration) {
    lines.push(`    Rest: ${formatDuration(set.restDuration)}`);
  }

  if (set.restAfter) {
    lines.push(`    Rest after set: ${formatDuration(set.restAfter)}`);
  }

  return lines.join("\n");
}

export function formatWorkout(workout: GeneratedWorkout): string {
  const lines: string[] = [];

  // Header
  lines.push("═".repeat(50));
  lines.push(`  ${workout.name.toUpperCase()}`);
  lines.push("═".repeat(50));

  if (workout.description) {
    lines.push(`  ${workout.description}`);
  }

  // Creator/Source attribution
  if (workout.creator || workout.source) {
    const attribution = [workout.creator, workout.source].filter(Boolean).join(" • ");
    lines.push(`  by ${attribution}`);
  }

  // Metadata
  const meta: string[] = [];
  if (workout.difficulty) meta.push(workout.difficulty);
  if (workout.estimatedDuration) meta.push(`~${workout.estimatedDuration} min`);
  if (workout.equipment?.length) meta.push(workout.equipment.join(", "));

  if (meta.length > 0) {
    lines.push(`  ${meta.join(" | ")}`);
  }

  lines.push("─".repeat(50));

  // Sets
  for (const set of workout.sets) {
    lines.push(formatSet(set));
  }

  // Tips
  if (workout.tips?.length) {
    lines.push("\n" + "─".repeat(50));
    lines.push("  TIPS:");
    for (const tip of workout.tips) {
      lines.push(`  • ${tip}`);
    }
  }

  // Legend - exercise descriptions
  if (workout.legend?.length) {
    lines.push("\n" + "─".repeat(50));
    lines.push("  EXERCISES:");
    for (const ex of workout.legend) {
      const dayTag = ex.challengeDay ? ` (Day ${ex.challengeDay})` : "";
      lines.push(`\n  ${ex.name}${dayTag}`);
      if (ex.description) {
        const descLines = wrapText(ex.description, 48, "    ");
        lines.push(...descLines);
      }
      // Show media links
      if (ex.media?.length) {
        for (const m of ex.media) {
          if (m.type === "youtube" || m.type === "video") {
            lines.push(`    📹 ${m.value}`);
          } else if (m.type === "image") {
            lines.push(`    🖼️  ${m.value}`);
          } else if (m.type === "link") {
            lines.push(`    🔗 ${m.value}`);
          }
        }
      }
    }
  }

  lines.push("\n" + "═".repeat(50));

  return lines.join("\n");
}

export function formatWorkoutJson(workout: GeneratedWorkout): string {
  return JSON.stringify(workout, null, 2);
}
