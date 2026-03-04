/**
 * Build script to bundle training notes into a gym-scannable quick reference.
 *
 * Full discussion notes live in docs/notes/*.md (for reading at home).
 * This script builds static/notes.md — a curated cheat sheet for the gym.
 *
 * To update the gym reference, edit static/notes.md directly.
 * This script just copies it and reports what discussion notes exist.
 *
 * Usage: deno run -A scripts/build-notes.ts
 */

const NOTES_PATH = new URL("../docs/notes", import.meta.url).pathname;
const OUTPUT_PATH = new URL("../static/notes.md", import.meta.url).pathname;

// Just verify the output exists and report on source notes
const noteFiles: string[] = [];
try {
  for await (const entry of Deno.readDir(NOTES_PATH)) {
    if (entry.name.endsWith(".md")) {
      noteFiles.push(entry.name);
    }
  }
} catch {
  console.warn("No docs/notes/ directory found");
}

noteFiles.sort();

try {
  const output = await Deno.readTextFile(OUTPUT_PATH);
  const lines = output.split("\n").length;
  console.log(`✅ Gym quick reference: static/notes.md (${lines} lines)`);
} catch {
  console.warn("⚠️  No static/notes.md found — create it manually");
}

console.log(`   Source notes (${noteFiles.length}):`);
for (const f of noteFiles) {
  console.log(`     docs/notes/${f}`);
}
