/**
 * Categorize all exercises: adds `category` field and backfills standard tags.
 *
 * Usage: deno run -A scripts/categorize-exercises.ts [--dry-run]
 *
 * Categories (13):
 *   chest, back-vertical-pull, back-horizontal-pull, shoulders,
 *   arms-biceps, arms-triceps, legs-quads, legs-hip-hinge, calves,
 *   core, full-body, mobility, cardio
 */

import { walk } from "@std/fs";

const EXERCISES_PATH = new URL("../exercises", import.meta.url).pathname;
const DRY_RUN = Deno.args.includes("--dry-run");

interface Exercise {
  id: string;
  name: string;
  type: string;
  muscles: string[];
  equipment: string[];
  tags: string[];
  difficulty?: string;
  category?: string;
  [key: string]: unknown;
}

// ─── Name-based overrides (highest priority) ───────────────────────────

const NAME_OVERRIDES: Record<string, string> = {
  // Back: vertical pulls
  "pull-up": "back-vertical-pull",
  "chin-up": "back-vertical-pull",
  "wide-grip-pull-up": "back-vertical-pull",
  "close-grip-pull-up": "back-vertical-pull",
  "commando-pull-up": "back-vertical-pull",
  "archer-pull-up": "back-vertical-pull",
  "typewriter-pull-up": "back-vertical-pull",
  "l-sit-pull-up": "back-vertical-pull",
  "one-arm-pull-up-negative": "back-vertical-pull",
  "negative-pull-up": "back-vertical-pull",
  "assisted-pull-up": "back-vertical-pull",
  "lat-pulldown": "back-vertical-pull",
  "single-arm-lat-pulldown": "back-vertical-pull",
  "dumbbell-pullover": "back-vertical-pull",
  "cable-pullover": "back-vertical-pull",
  "muscle-up": "back-vertical-pull",
  "skin-the-cat": "back-vertical-pull",
  "ice-cream-maker": "back-vertical-pull",
  "front-lever-pull": "back-vertical-pull",
  "straight-arm-pulldown": "back-vertical-pull",

  // Back: horizontal pulls
  "superman": "back-horizontal-pull",
  "reverse-snow-angels": "back-horizontal-pull",
  "reverse-hyper": "legs-hip-hinge",
  "face-pull": "back-horizontal-pull",
  "inverted-row": "back-horizontal-pull",
  "horizontal-row": "back-horizontal-pull",
  "barbell-bent-over-row": "back-horizontal-pull",
  "dumbbell-row": "back-horizontal-pull",
  "gorilla-row": "back-horizontal-pull",
  "chest-supported-t-bar-row": "back-horizontal-pull",
  "chest-supported-neutral-grip-row": "back-horizontal-pull",
  "chest-supported-low-row": "back-horizontal-pull",
  "chest-supported-machine-row": "back-horizontal-pull",
  "chest-supported-seated-cable-row": "back-horizontal-pull",
  "cable-row-machine": "back-horizontal-pull",
  "smith-machine-inverted-row": "back-horizontal-pull",
  "incline-row": "back-horizontal-pull",

  // Chest
  "bench-press": "chest",
  "incline-dumbbell-press": "chest",
  "decline-barbell-press": "chest",
  "cable-chest-press": "chest",
  "smith-machine-incline-press": "chest",
  "smith-machine-close-grip-press": "chest",
  "chest-press-machine": "chest",
  "seated-pec-fly-machine": "chest",
  "dip": "chest",

  // Shoulders
  "barbell-shoulder-press": "shoulders",
  "seated-dumbbell-shoulder-press": "shoulders",
  "shoulder-press-machine": "shoulders",
  "smith-machine-shoulder-press": "shoulders",
  "seated-barbell-press": "shoulders",
  "arnold-press": "shoulders",
  "overhead-press": "shoulders",
  "kettlebell-overhead-press": "shoulders",
  "cable-lateral-raise": "shoulders",
  "lateral-raise": "shoulders",
  "front-raise": "shoulders",
  "dumbbell-shrug": "shoulders",
  "kettlebell-push-press": "shoulders",
  "kettlebell-high-pull": "shoulders",
  "push-press": "shoulders",
  "dead-hang": "back-vertical-pull",
  "arch-hang": "back-vertical-pull",
  "l-hang": "core",

  // Gymnastics holds — levers/planches are core or back, not shoulders
  "front-lever": "core",
  "advanced-tuck-front-lever": "core",
  "tuck-front-lever": "core",
  "straddle-front-lever": "core",
  "back-lever": "core",
  "tuck-back-lever": "core",
  "advanced-tuck-back-lever": "core",
  "straddle-back-lever": "core",
  "tuck-planche": "core",
  "advanced-tuck-planche": "core",
  "straddle-planche": "core",
  "full-planche": "core",
  "l-sit": "core",

  // Core specific
  "mountain-climber": "core",
  "slow-mountain-climbers": "core",
  "cross-body-mountain-climbers": "core",
  "bird-dog": "core",
  "bear-crawl-hold": "core",
  "lower-back-raises": "legs-hip-hinge",

  // Chest
  "pec-deck-fly": "chest",

  // Arms
  "bicep-curl": "arms-biceps",
  "preacher-curl": "arms-biceps",
  "incline-curl": "arms-biceps",
  "single-arm-preacher-cable-curl": "arms-biceps",
  "seated-behind-back-cable-curl": "arms-biceps",
  "hammer-curl": "arms-biceps",
  "overhead-tricep-extension": "arms-triceps",
  "dumbbell-skull-crusher": "arms-triceps",
  "cable-tricep-pushdown": "arms-triceps",
  "narrow-grip-bench-press": "arms-triceps",
  "tricep-dip": "arms-triceps",

  // Legs: quads
  "leg-press": "legs-quads",
  "hack-squat": "legs-quads",
  "pendulum-squat": "legs-quads",
  "smith-machine-squat": "legs-quads",
  "dumbbell-goblet-squat": "legs-quads",
  "split-squat": "legs-quads",
  "bulgarian-split-squat": "legs-quads",
  "smith-machine-bulgarian-split-squat": "legs-quads",
  "leg-extension": "legs-quads",
  "sissy-squat": "legs-quads",
  "pistol-squat": "legs-quads",
  "shrimp-squat": "legs-quads",
  "step-up": "legs-quads",
  "smith-machine-step-up": "legs-quads",

  // Legs: hip hinge
  "romanian-deadlift": "legs-hip-hinge",
  "deadlift": "legs-hip-hinge",
  "sumo-deadlift": "legs-hip-hinge",
  "hip-thrust": "legs-hip-hinge",
  "smith-machine-hip-thrust": "legs-hip-hinge",
  "glute-bridge": "legs-hip-hinge",
  "good-morning": "legs-hip-hinge",
  "barbell-good-morning": "legs-hip-hinge",
  "smith-machine-good-morning": "legs-hip-hinge",
  "back-extension": "legs-hip-hinge",
  "smith-machine-romanian-deadlift": "legs-hip-hinge",
  "seated-leg-curl": "legs-hip-hinge",
  "leg-curl-machine": "legs-hip-hinge",
  "single-leg-deadlift": "legs-hip-hinge",
  "kettlebell-swing": "legs-hip-hinge",
  "american-kettlebell-swing": "legs-hip-hinge",

  // Calves
  "standing-calf-raise": "calves",
  "smith-machine-calf-raise": "calves",
  "calf-raise-machine": "calves",
  "leg-press-calf-raise": "calves",
  "banded-calf-raises": "calves",

  // Core specific
  "cable-crunch": "core",
  "pallof-press": "core",
  "hanging-leg-raise": "core",
  "ab-wheel-rollout": "core",
  "dead-bug": "core",
  "russian-twist": "core",

  // Cardio
  "running": "cardio",
};

// ─── Category assignment rules ─────────────────────────────────────────

function assignCategory(ex: Exercise): string {
  // 1. Check name overrides first
  if (NAME_OVERRIDES[ex.id]) {
    return NAME_OVERRIDES[ex.id];
  }

  const m = ex.muscles;
  const t = ex.tags;
  const name = ex.name.toLowerCase();
  const id = ex.id.toLowerCase();

  // Helper checks
  const hasMuscle = (...ms: string[]) => ms.some((x) => m.includes(x));
  const hasTag = (...ts: string[]) => ts.some((x) => t.includes(x));
  const nameIncludes = (...ns: string[]) => ns.some((x) => name.includes(x) || id.includes(x));

  // 2. Cardio type
  if (ex.type === "cardio" || hasTag("jump-rope")) return "cardio";

  // 3. Mobility / warmup / stretch / rehab / yoga
  if (ex.type === "yoga") return "mobility";
  if (ex.type === "stretch") return "mobility";
  if (ex.type === "rehab") return "mobility";
  if (t.length > 0 && t.every((tag) => ["warmup", "mobility", "stretch", "gentle", "recovery", "hip-opener", "cooldown", "breathing"].includes(tag))) {
    return "mobility";
  }

  // 4. Calves (very specific)
  if (hasMuscle("calves") && !hasMuscle("quads", "hamstrings", "glutes") && nameIncludes("calf", "calve")) {
    return "calves";
  }

  // 5. Arms - biceps isolation
  if (nameIncludes("curl", "bicep") && hasMuscle("biceps") && !hasMuscle("back", "lats")) {
    return "arms-biceps";
  }

  // 6. Arms - triceps isolation
  if (nameIncludes("tricep", "skull", "pushdown", "push-down") && hasMuscle("triceps") && !hasMuscle("chest")) {
    return "arms-triceps";
  }
  if (nameIncludes("narrow-grip", "close-grip") && hasMuscle("triceps")) {
    return "arms-triceps";
  }

  // 7. Back - horizontal pulls (rows, face pulls)
  if (nameIncludes("row", "face-pull", "face pull") && hasMuscle("back", "upper-back", "lats")) {
    return "back-horizontal-pull";
  }

  // 8. Back - vertical pulls (pullups, pulldowns, pullovers)
  if (nameIncludes("pull-up", "pullup", "pull up", "pulldown", "pull-down", "pullover", "pull-over", "lat-pull", "muscle-up", "skin-the-cat")) {
    return "back-vertical-pull";
  }
  if (hasMuscle("lats") && hasTag("pull") && !nameIncludes("row")) {
    return "back-vertical-pull";
  }

  // 9. Chest
  if (hasMuscle("chest") && hasTag("push", "press") && !hasMuscle("back", "lats")) {
    // Exclude exercises where chest is secondary (e.g., ring support hold)
    if (m[0] === "chest" || m.indexOf("chest") <= 1) {
      return "chest";
    }
  }
  if (nameIncludes("bench press", "bench-press", "chest press", "chest-press", "pec fly", "pec-fly", "dip") && hasMuscle("chest")) {
    return "chest";
  }
  if (nameIncludes("push-up", "push up", "pushup") && hasMuscle("chest")) {
    return "chest";
  }

  // 10. Shoulders
  if (hasMuscle("shoulders") && hasTag("press", "lateral", "lateral-delts", "rear-delts") && !hasMuscle("chest", "back", "lats")) {
    return "shoulders";
  }
  if (nameIncludes("shoulder press", "shoulder-press", "overhead press", "overhead-press", "lateral raise", "lateral-raise", "shrug", "front raise", "front-raise")) {
    return "shoulders";
  }

  // 11. Legs: hip hinge
  if (hasTag("hinge", "hip-hinge", "deadlift") && hasMuscle("hamstrings", "glutes")) {
    return "legs-hip-hinge";
  }
  if (nameIncludes("deadlift", "hip thrust", "hip-thrust", "glute bridge", "glute-bridge", "good morning", "good-morning", "hamstring curl", "leg curl", "back extension", "back-extension")) {
    return "legs-hip-hinge";
  }
  if (nameIncludes("swing") && hasMuscle("glutes", "hamstrings")) {
    return "legs-hip-hinge";
  }

  // 12. Legs: quads
  if (hasTag("squat") && hasMuscle("quads", "glutes")) {
    return "legs-quads";
  }
  if (nameIncludes("squat", "lunge", "step-up", "step up", "leg press", "leg-press", "leg extension", "leg-extension")) {
    return "legs-quads";
  }

  // 13. Core
  if (hasTag("core", "abs", "obliques", "anti-rotation", "anti-extension") && m.every((muscle) =>
    ["core", "abs", "obliques", "hip-flexors", "transverse-abdominis", "rectus-abdominis", "internal-obliques", "serratus", "pelvic-floor", "lower-back", "erector-spinae", "diaphragm"].includes(muscle)
  )) {
    return "core";
  }
  if (nameIncludes("plank", "crunch", "sit-up", "leg raise", "leg-raise", "dead bug", "dead-bug", "deadbug", "russian twist", "russian-twist", "pallof", "ab wheel", "ab-wheel", "v-up", "v-tuck", "bicycle")) {
    return "core";
  }

  // 14. Barre (type-based)
  if (ex.type === "barre") return "legs-quads"; // Most barre is leg-focused

  // 15. Full-body fallback for compound movements
  if (hasTag("full-body") || hasMuscle("full-body")) return "full-body";
  if (hasMuscle("quads", "glutes") && hasMuscle("shoulders", "chest", "back")) return "full-body";

  // 16. Plyo - categorize by primary muscle
  if (ex.type === "plyo") {
    if (hasMuscle("quads", "glutes", "hamstrings", "calves")) return "legs-quads";
    if (hasMuscle("chest", "triceps")) return "chest";
    return "full-body";
  }

  // 17. Remaining lower-body
  if (hasTag("lower-body") && hasMuscle("quads", "glutes")) return "legs-quads";
  if (hasTag("lower-body") && hasMuscle("hamstrings", "glutes")) return "legs-hip-hinge";

  // 18. Remaining upper-body
  if (hasMuscle("chest") && hasTag("push")) return "chest";
  if (hasMuscle("back", "lats") && hasTag("pull")) return "back-vertical-pull";
  if (hasMuscle("shoulders")) return "shoulders";
  if (hasMuscle("triceps")) return "arms-triceps";
  if (hasMuscle("biceps")) return "arms-biceps";

  // 19. Core fallback (exercises primarily targeting core-adjacent muscles)
  if (hasMuscle("core", "abs", "obliques")) return "core";

  // 20. Lower body fallback
  if (hasMuscle("quads", "hamstrings", "glutes", "calves", "hips", "hip-flexors", "adductors")) return "legs-quads";

  // 21. Last resort
  return "full-body";
}

// ─── Tag backfill rules ────────────────────────────────────────────────

function backfillTags(ex: Exercise): string[] {
  const added: string[] = [];
  const m = ex.muscles;
  const t = ex.tags;
  const cat = ex.category!;

  function addTag(tag: string) {
    if (!t.includes(tag)) {
      t.push(tag);
      added.push(tag);
    }
  }

  // Movement direction
  if (cat === "chest" || cat === "shoulders" || cat === "arms-triceps") {
    addTag("push");
  }
  if (cat === "back-vertical-pull" || cat === "back-horizontal-pull" || cat === "arms-biceps") {
    addTag("pull");
  }

  // Body section
  if (["chest", "back-vertical-pull", "back-horizontal-pull", "shoulders", "arms-biceps", "arms-triceps"].includes(cat)) {
    addTag("upper-body");
  }
  if (["legs-quads", "legs-hip-hinge", "calves"].includes(cat)) {
    addTag("lower-body");
  }

  // Movement sub-type
  if (cat === "back-vertical-pull") addTag("vertical-pull");
  if (cat === "back-horizontal-pull") addTag("horizontal-pull");
  if (cat === "legs-hip-hinge" && m.some((x) => ["hamstrings", "glutes"].includes(x))) {
    addTag("hinge");
  }

  // Compound vs isolation heuristics
  if (cat.startsWith("arms-") && !t.includes("compound") && !t.includes("isolation")) {
    addTag("isolation");
  }
  if (cat === "calves" && !t.includes("isolation")) {
    addTag("isolation");
  }

  // Gym tag for machine/cable/barbell/dumbbell exercises
  if (ex.equipment.some((e) => ["machine", "cable", "barbell", "smith-machine", "hack-squat-machine", "leg-press-machine"].includes(e))) {
    addTag("gym");
  }

  return added;
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log(`🏷️  Categorizing exercises${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

  const stats = {
    total: 0,
    categorized: 0,
    tagsAdded: 0,
    byCategory: {} as Record<string, number>,
    overrideUsed: 0,
    fallbacks: [] as string[],
  };

  for await (const entry of walk(EXERCISES_PATH, { exts: [".json"], includeDirs: false })) {
    try {
      const content = await Deno.readTextFile(entry.path);
      const ex = JSON.parse(content) as Exercise;

      if (!ex.id || !ex.name) continue;
      stats.total++;

      // Assign category
      const category = assignCategory(ex);
      ex.category = category;

      if (NAME_OVERRIDES[ex.id]) stats.overrideUsed++;
      if (category === "full-body" && !ex.tags.includes("full-body")) {
        stats.fallbacks.push(`${ex.id} (${ex.muscles.join(", ")})`);
      }

      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      stats.categorized++;

      // Backfill tags
      const addedTags = backfillTags(ex);
      stats.tagsAdded += addedTags.length;

      // Write back
      if (!DRY_RUN) {
        // Rebuild JSON preserving key order: id, name, category, type, muscles, ...
        const ordered: Record<string, unknown> = {};
        ordered.id = ex.id;
        ordered.name = ex.name;
        ordered.category = ex.category;
        ordered.type = ex.type;
        ordered.muscles = ex.muscles;
        ordered.equipment = ex.equipment;
        ordered.tags = ex.tags;
        // Copy remaining keys
        for (const key of Object.keys(ex)) {
          if (!["id", "name", "category", "type", "muscles", "equipment", "tags"].includes(key)) {
            ordered[key] = ex[key];
          }
        }
        await Deno.writeTextFile(entry.path, JSON.stringify(ordered, null, 2) + "\n");
      }

      if (addedTags.length > 0) {
        console.log(`  ${ex.id}: category=${category}, +tags=[${addedTags.join(", ")}]`);
      }
    } catch (e) {
      console.warn(`  ⚠️ Error: ${entry.name}:`, e);
    }
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log(`📊 SUMMARY`);
  console.log("═".repeat(60));
  console.log(`Total exercises: ${stats.total}`);
  console.log(`Categorized:     ${stats.categorized}`);
  console.log(`Tags added:      ${stats.tagsAdded}`);
  console.log(`Name overrides:  ${stats.overrideUsed}`);
  console.log("");

  // Category breakdown
  console.log("Category breakdown:");
  const sorted = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sorted) {
    console.log(`  ${cat.padEnd(25)} ${count}`);
  }

  // Fallbacks that need review
  if (stats.fallbacks.length > 0) {
    console.log(`\n⚠️  ${stats.fallbacks.length} exercises fell back to 'full-body' (review these):`);
    for (const f of stats.fallbacks) {
      console.log(`  - ${f}`);
    }
  }

  if (DRY_RUN) {
    console.log("\n🔍 DRY RUN — no files were modified.");
  } else {
    console.log("\n✅ Done! All exercise files updated.");
  }
}

main().catch(console.error);
