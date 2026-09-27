/**
 * Load-history audit: dump every lift's weight/station/reps timeline across all
 * functional-bulk session logs, so weekly generation starts from ground truth
 * instead of copying last week's (possibly drifted) descriptor.
 *
 * Usage:
 *   deno task audit                 # every lift, full timeline
 *   deno task audit cable           # only lifts whose id contains "cable"
 *   deno task audit cable-crunch    # one lift
 *   deno task audit --selfcheck     # tiny self-test
 *
 * A ⚠️ marks a lift whose logged `equipment`/station changed across weeks —
 * the exact failure mode behind descriptor drift (a number is only honest if
 * you know which machine it's on).
 */

import { walk } from "@std/fs";

const LOGS_PATH = new URL("../programs/logs", import.meta.url).pathname;

interface SetLike {
  weight?: string | number;
  equipment?: string;
  reps?: string | number;
  notes?: string;
}
interface Entry {
  week: number;
  day: number;
  date?: string;
  sets: SetLike[];
}

// A set can be a full object or a bare string in older logs — normalize both.
function normalizeSets(raw: unknown): SetLike[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) =>
    (s && typeof s === "object") ? s as SetLike : { weight: String(s) }
  );
}

function fmtSet(s: SetLike): string {
  const w = s.weight ?? "?";
  const equip = s.equipment ? `@${s.equipment}` : "";
  const reps = s.reps != null ? `x${s.reps}` : "";
  return `${w}${equip}${reps}`;
}

async function collect(): Promise<Map<string, Entry[]>> {
  const byLift = new Map<string, Entry[]>();
  for await (
    const f of walk(LOGS_PATH, { exts: ["json"], includeDirs: false })
  ) {
    const m = f.name.match(/-w(\d+)\.json$/);
    if (!m) continue;
    const week = Number(m[1]);
    let days: any[];
    try {
      days = JSON.parse(await Deno.readTextFile(f.path));
    } catch {
      continue;
    }
    if (!Array.isArray(days)) continue;
    for (const day of days) {
      for (const ex of day.exercises ?? []) {
        if (!ex?.id) continue;
        const list = byLift.get(ex.id) ?? [];
        list.push({
          week,
          day: day.day,
          date: day.date,
          sets: normalizeSets(ex.sets),
        });
        byLift.set(ex.id, list);
      }
    }
  }
  return byLift;
}

function stationsOf(entries: Entry[]): string[] {
  const set = new Set<string>();
  for (const e of entries) {
    for (const s of e.sets) if (s.equipment) set.add(s.equipment);
  }
  return [...set];
}

function report(byLift: Map<string, Entry[]>, filter: string): void {
  const ids = [...byLift.keys()]
    .filter((id) => !filter || id.includes(filter))
    .sort();
  if (ids.length === 0) {
    console.log(`No lifts matching "${filter}".`);
    return;
  }
  for (const id of ids) {
    const entries = byLift.get(id)!.sort((a, b) =>
      a.week - b.week || a.day - b.day
    );
    const stations = stationsOf(entries);
    const drift = stations.length > 1 ? "  ⚠️ STATION DRIFT" : "";
    console.log(`\n${id}${drift}`);
    if (stations.length > 1) {
      console.log(`  stations seen: ${stations.join(" | ")}`);
    }
    for (const e of entries) {
      const sets = e.sets.map(fmtSet).join("; ") || "(no sets)";
      console.log(`  W${e.week}D${e.day}: ${sets}`);
    }
  }
}

function selfcheck(): void {
  const a = normalizeSets([{ weight: 90, equipment: "DB", reps: 8 }, "bw"]);
  if (a.length !== 2) throw new Error("length");
  if (fmtSet(a[0]) !== "90@DBx8") throw new Error(`obj: ${fmtSet(a[0])}`);
  if (fmtSet(a[1]) !== "bw") throw new Error(`str: ${fmtSet(a[1])}`);
  if (stationsOf([{ week: 1, day: 1, sets: a }]).join() !== "DB") {
    throw new Error("stations");
  }
  console.log("selfcheck ok");
}

if (import.meta.main) {
  const arg = Deno.args[0] ?? "";
  if (arg === "--selfcheck") {
    selfcheck();
  } else {
    report(await collect(), arg);
  }
}
