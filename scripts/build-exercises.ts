/**
 * Build script to bundle all exercises into a single JSON file for browser use.
 *
 * Usage: deno run -A scripts/build-exercises.ts
 */

import { walk } from "@std/fs";

const EXERCISES_PATH = new URL("../exercises", import.meta.url).pathname;
const WORKOUTS_PATH = new URL("../workouts", import.meta.url).pathname;
const OUTPUT_PATH = new URL("../static/exercises.json", import.meta.url).pathname;

interface SourceRef {
  url: string;
  label?: string;
  platform?: string;
}

interface FlowRef {
  workoutId: string;
  name: string;
  source?: string;
  sourceUrl?: string;
}

interface Exercise {
  id: string;
  name: string;
  category?: string;
  type: string;
  muscles: string[];
  equipment: string[];
  tags: string[];
  difficulty?: string;
  description?: string;
  challenge?: {
    id: string;
    name: string;
    creator?: string;
    day: number;
  };
  media?: Array<{
    type: string;
    value: string;
    caption?: string;
    source?: string;
  }>;
  source?: {
    platform?: string;
    url?: string;
    creator?: string;
    capturedAt?: string;
  };
  sources?: SourceRef[];
  flows?: FlowRef[];
}

// Bare platform words make poor citation labels — prefer a creator/name when
// one is available for the same URL (Facebook has no @handles, so we fudge with
// the creator name recorded on the flow/source).
const PLATFORM_WORDS = new Set(["facebook", "fb", "instagram", "ig", "tiktok", "youtube", "yt", "twitter", "x"]);
function isWeakLabel(label?: string): boolean {
  return !label || PLATFORM_WORDS.has(label.trim().toLowerCase());
}
function titleCaseLabel(label?: string): string | undefined {
  if (!label) return label;
  const l = label.trim();
  return l.charAt(0).toUpperCase() + l.slice(1);
}

/**
 * Build the citation reverse-index from flow bundles under workouts/.
 * A "flow bundle" = any workout with isFlow===true or a flowSequence array.
 * Maps each move id → the flows it appears in + those flows' source videos.
 * Reads raw workouts/*.json (NOT static/workouts.json — build:exercises runs
 * before build:workouts, so the built catalogue may be stale/absent).
 */
async function buildCitationGraph(): Promise<Map<string, { sources: SourceRef[]; flows: FlowRef[] }>> {
  const graph = new Map<string, { sources: SourceRef[]; flows: FlowRef[] }>();

  for await (const entry of walk(WORKOUTS_PATH, {
    exts: [".json"],
    includeDirs: false,
  })) {
    // deno-lint-ignore no-explicit-any
    let data: any;
    try {
      data = JSON.parse(await Deno.readTextFile(entry.path));
    } catch {
      continue;
    }

    const isFlowBundle = data.isFlow === true || Array.isArray(data.flowSequence);
    if (!isFlowBundle || !Array.isArray(data.flowSequence)) continue;

    const flowRef: FlowRef = {
      workoutId: data.id,
      name: data.name,
      source: data.source,
      sourceUrl: data.sourceUrl,
    };

    const seenInFlow = new Set<string>();
    for (const move of data.flowSequence) {
      const moveId = move?.id;
      if (!moveId || seenInFlow.has(moveId)) continue;
      seenInFlow.add(moveId);

      if (!graph.has(moveId)) graph.set(moveId, { sources: [], flows: [] });
      const node = graph.get(moveId)!;
      node.flows.push(flowRef);
      if (data.sourceUrl) {
        node.sources.push({ url: data.sourceUrl, label: data.source, platform: "flow" });
      }
    }
  }

  return graph;
}

async function buildExercises(): Promise<void> {
  console.log("🏋️ Building exercises catalogue...\n");

  const exercises: Exercise[] = [];
  let count = 0;
  let errors = 0;

  for await (const entry of walk(EXERCISES_PATH, {
    exts: [".json"],
    includeDirs: false,
  })) {
    try {
      const content = await Deno.readTextFile(entry.path);
      const data = JSON.parse(content) as Exercise;

      // Basic validation
      if (!data.id || !data.name) {
        console.warn(`  ⚠️ Skipping ${entry.name}: missing id or name`);
        errors++;
        continue;
      }

      exercises.push(data);
      count++;
    } catch (e) {
      console.warn(`  ⚠️ Error parsing ${entry.name}:`, e);
      errors++;
    }
  }

  // Sort by id for consistent output
  exercises.sort((a, b) => a.id.localeCompare(b.id));

  // Derive the citation graph (sources[] + flows[]) from flow bundles and
  // attach it to each exercise. Own-source first so it wins on URL dedupe.
  const graph = await buildCitationGraph();
  let graphed = 0;
  for (const ex of exercises) {
    const sources: SourceRef[] = [];
    const byUrl = new Map<string, SourceRef>();
    const addSource = (url?: string, label?: string, platform?: string) => {
      if (!url) return;
      const existing = byUrl.get(url);
      if (existing) {
        // Upgrade a bare-platform label (e.g. "facebook") to a real creator/name.
        if (isWeakLabel(existing.label) && !isWeakLabel(label)) existing.label = label;
        return;
      }
      const ref: SourceRef = { url };
      if (label) ref.label = label;
      if (platform) ref.platform = platform;
      byUrl.set(url, ref);
      sources.push(ref);
    };

    // 1. The move's own extraction source (object shape).
    if (ex.source?.url) {
      addSource(ex.source.url, ex.source.creator || ex.source.platform, ex.source.platform);
    }
    // 2. The move's own media links (external, non-image).
    for (const m of ex.media ?? []) {
      if (m.type !== "image" && /^https?:\/\//.test(m.value)) {
        addSource(m.value, m.source || m.caption, m.type);
      }
    }
    // 3. Every flow the move appears in (string source normalized here, deduped by URL).
    const node = graph.get(ex.id);
    if (node) for (const s of node.sources) addSource(s.url, s.label, s.platform);

    // Any label still a bare platform word gets title-cased ("facebook" → "Facebook").
    for (const s of sources) if (isWeakLabel(s.label)) s.label = titleCaseLabel(s.label);

    if (sources.length) ex.sources = sources;
    if (node && node.flows.length) ex.flows = node.flows;
    if (ex.sources || ex.flows) graphed++;
  }

  // Write output
  await Deno.writeTextFile(OUTPUT_PATH, JSON.stringify(exercises, null, 2));

  const stats = {
    total: count,
    errors,
    types: [...new Set(exercises.map(e => e.type))],
    categories: [...new Set(exercises.map(e => e.category).filter(Boolean))],
    challenges: [...new Set(exercises.filter(e => e.challenge).map(e => e.challenge!.id))],
  };

  console.log(`✅ Built ${count} exercises → static/exercises.json`);
  console.log(`   Types: ${stats.types.join(", ")}`);
  console.log(`   Categories: ${stats.categories.join(", ")}`);
  console.log(`   Challenges: ${stats.challenges.length > 0 ? stats.challenges.join(", ") : "none"}`);
  console.log(`   Citation graph: ${graphed} exercises carry sources/flows`);
  if (errors > 0) {
    console.log(`   ⚠️ ${errors} files skipped due to errors`);
  }

  // Also output a summary
  const sizeKb = (await Deno.stat(OUTPUT_PATH)).size / 1024;
  console.log(`   Size: ${sizeKb.toFixed(1)} KB`);
}

buildExercises().catch(console.error);
