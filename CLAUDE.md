# WOD (Workout of the Day)

Fitness exercise library and workout generator. Deno-based app with JSON exercise/workout data.

## Project Structure

- `exercises/*.json` — Individual exercise definitions (514+)
- `workouts/<category>/*.json` — Workout routines organized by type (gym, kettlebell, cardio, etc.)
- `programs/*.json` — Multi-week training programs
- `progressions/*.json` — Skill progression chains (RRR)
- `static/exercises.json` — Built exercise catalogue (run `deno task build:exercises`)
- `static/workouts.json` — Built workout catalogue (run `deno task build:workouts`)
- `docs/` — Schemas, source tracking, and design docs

## Extracting Workouts from Social Media

Two skills are available for extracting structured workout data from video posts:

### X/Twitter posts — use `wod-xai-extract`

Uses Grok (xAI) with native X search and video understanding.

```
mcp__deno-hub__coverflow_workflow_run with args: "xai-twitter-workout-extract --quiet --url=TWEET_URL --handle=HANDLE"
```

- `--handle` is the Twitter handle without @ (e.g. `Asgooch`)
- Best for X/Twitter content — Grok has native access to tweets and video

### Other video platforms — use `wod-video-extract`

Uses yt-dlp + Gemini vision. Supports Facebook, Instagram, TikTok, YouTube, etc. **LOCAL ONLY** — requires yt-dlp installed.

```
mcp__deno-hub__coverflow_workflow_run with args: "video-workout-extract --quiet --url=VIDEO_URL"
```

- Add `--outputDir=./workouts/extracted` to save JSON output
- Add `--keepFiles=all` to also keep the downloaded video

### Post-Extraction Workflow

After extracting from either skill:

1. Review the JSON output for accuracy
2. Check which exercises already exist (`exercises/*.json`)
3. Create missing exercises following `docs/EXTRACT_SCHEMA.md`
4. **Always include `source` on new exercises:**
   ```json
   "source": {
     "platform": "twitter",
     "url": "https://x.com/handle/status/123",
     "creator": "@handle",
     "capturedAt": "2026-02-22"
   }
   ```
5. Create workout file in appropriate directory with `source`/`sourceUrl` fields:
   ```json
   "source": "@handle",
   "sourceUrl": "https://x.com/handle/status/123"
   ```
6. Rebuild: `deno task build:exercises` and `deno task build:workouts`
7. Update `docs/SOURCES.md` with the new source entry

## Key Schemas

- **Exercise JSON schema:** See existing files in `exercises/` — fields: id, name, category, type, muscles, equipment, tags, difficulty, duration, description, source
- **Workout JSON schema:** See existing files in `workouts/` — fields: id, name, description, routineId, tags, estimatedDuration, equipment, difficulty, source, sourceUrl, sets[], tips[], media[]
- **Extraction schema:** `docs/EXTRACT_SCHEMA.md` — full schema for raw extraction output with confidence scores and raw data

## Build Commands

- `deno task build` — Build everything (styles + exercises + workouts)
- `deno task build:exercises` — Rebuild exercises catalogue
- `deno task build:workouts` — Rebuild workouts catalogue
- `deno task dev` — Dev server on port 8010
- `deno task deploy` — Deploy the app to Deno Deploy production (org `yawnxyz`, app `wod`)

**"Publish" = deploy.** When the user says "publish" (e.g. "publish W13"), run `deno task deploy` — the Deno Deploy production deploy. It does NOT mean `deno publish` (JSR) and does NOT mean a git commit/PR.

## Docs

- `docs/EXTRACT_SCHEMA.md` — Extraction schema for exercises and workouts from social media
- `docs/SOURCES.md` — Tracks all content sources and attribution
- `docs/EXTRACT_NOTES.md` — Running notes on extraction patterns, platform quirks, and exercise name mappings
- `docs/COVERFLOW-VIDEO-PERSISTENCE.md` — Design doc for coverflow file I/O (input files + output persistence)
- `docs/notes/` — Training discussion notes, readings, and research summaries with sources

## Gym Day Cool-Down (W12+)

**Every gym day** (push / pull / legs) ends with a 5-min cool-down block as its final station. This is non-negotiable — added W12D1 after the user surfaced the new-muscle + universal-tightness pattern + the right-shoulder cluster. The connective tissue lags muscle adaptation by 6-8 weeks; this is the input that lets it catch up.

**Standard cool-down sequence (~5 min total):**
1. Doorframe pec stretch — 60s (30s each arm at MID elbow)
2. Dead hang — 45s passive
3. Supine spinal twist — 60s (30s each side)
4. 90/90 stretch — 90s (45s each side)
5. Child's pose — 60s with slow breathing

The exact moves can swap if a session targets a different chain (e.g., legs day might bias toward hip/QL stretches), but the **5-min minimum + parasympathetic shift goal** stays. Use existing exercises — don't proliferate new files for cool-down variants.

## Sunday Long Flow (W12+)

Day 7 (Sunday) is `REST or LONG FLOW` — a choice between full rest or the 25-30 min yin/restorative session (`fb-sunday-long-flow`). Long-hold (90s-2min) work is what fascia responds to, vs. morning flow's activation-grade 30-60s holds. Encourage the long flow during high-fatigue weeks; full rest is fine when the week was light.

## Heal Weeks (Lighter Weeks — Symptom-Driven)

**Lighter weeks are symptom-driven, NOT a locked calendar cadence.** Take one when the body signals it — a nagging joint or symptom cluster, accumulated soft-tissue tightness, sleep/energy dipping. This program is form-first (loads are held, not chased), so there is no heavy-progressive-overload fatigue to "deload" from in the classic sense — don't schedule lighter weeks by the calendar. These weeks recur — the right shoulder is a long-running issue and lighter/heal stretches have come up repeatedly across the program (W9's QL spasm, W13's shoulder cluster, and others before). Recurrence is expected, not a failure of the plan; still trigger each one by symptoms, not by date. If heal weeks keep recurring for the *same* shoulder, that's a signal the fix is structural (mobility, a specific lift's mechanics, possibly a PT eval) — backing off manages the symptom but doesn't resolve it.

**Heal-week structure:**
- HOLD all loads (no progression, no PR attempts)
- CUT volume to ~60-70%: typically drop a set per exercise (3→2) OR drop reps (10→6-8). Pick one lever per exercise.
- Keep NEW lifts at their introduction volume
- KB days keep full variety — KB flow/skill work isn't the fatigue source; trim the loaded gym work, not the flows
- Morning flows stay; Sunday long flow encouraged
- End-of-session cool-down stays (permanent every-gym-day)

When generating a heal week, write `dayOverview.theme` to call out that it's a heal week + the specific symptoms/signals that motivated it.

## Form Cue: "Pack DOWN, Not UP"

For lifts that have a "pack the shoulders" cue (push press, chest press machine, incline DB press, lateral raise, KB press work, pull-up, lat pulldown), the cue means **shoulder blades pulled DOWN and BACK** (into the back pockets), neck long, traps relaxed. Shrug-up-and-grip is the corrupted version that builds upper-trap dominance.

**Practical test:** if the cue can't hold at current load (i.e., the user must shrug up to complete the rep), the load is too heavy *for the cue* — drop until it can. The cue is the progression, not the number. Bake this check into spotlight notes on the upper-trap-vulnerable lifts.

## Morning Flow Design

When creating morning flows for the functional-bulk program:

- **Three-part structure, ~15 min total:**
  1. **Primer** (~3 min) — day-specific activation (hangs/scap pulls for pull, shoulder openers for push, hip circles for legs, etc.)
  2. **Work block** (~5 min) — core, push-ups, barre movements, or light bodyweight work. Gets the body warm. Can mix in Action Jacqueline-style barre (plie pulses, relevés) for variety.
  3. **Yoga flow** (~7 min) — flowing transitions, NOT isolated holds. Include straddle + hip openers. Should feel like one continuous arc. Goes last because warm muscles stretch deeper.
- **Order matters:** work before stretches. Warm body = deeper stretches.
- **Not too hard or long** — these precede a gym session. The work block should activate, not fatigue.
- **Variety across the week — REQUIRED: the morning flow MUST meaningfully rotate week to week.** Do NOT carry the same set forward. Swap roughly half the moves each week while keeping the rehab anchors (prone Y-raise, scapular push-up, wall angel, side-lying ER, dead hang, scapular pull). Pull replacements from the morning-flow pool in NOTES.md "Rotation Pool" — including older favorites that haven't appeared lately (the W12-era flows had very different content: thread-the-needle, puppy pose, happy baby, couch stretch, etc. — cycle those back in). Never let the flow calcify. See "Rotation Discipline" below.

## Rotation Discipline (W17+)

Weeks are built off the last, so movements silently fall off the bottom and never cycle back (the W16 KB redesign dropped 6+ moves at once; cossack fell off the KB days after W15). Rotation must be a **carousel, not a forward-only conveyor.** The move pools and tier assignments live in `NOTES.md` "Rotation Pool" — this is the rule:

- **Two tiers — anchors stay every week, the pool rotates.** When building a week, glance at the last ~3-4 weeks of that day (**the workout files ARE the history — no separate last-seen tracking**) and deliberately pull 1-2 POOL moves that have NOT appeared recently, especially retired favorites — instead of only adding new material on top.
- **Anchors NEVER rotate out:** the protective/rehab scaffold (KB-day banded shoulder prep, push-day Yuri's band warmup, protective shrug, gym cool-down), the canonical Bent Press Flow (formerly "OTD flow"), and the strength anchors. **Do NOT add band cuff/scap work to push/pull warmups** — those days already run long, and Yuri's (push) / band-pull-apart (pull) already cover the shoulder; band prep lives on KB days.
- **Two hard guardrails (the user's conditions):** (1) **body-part coverage holds every week** — rotating a move means swapping in another that hits the same pattern, never leaving a gap; (2) **strength keeps building** — the strength anchors stay in most weeks so the floor keeps rising. Rotation is for variety / skill / mobility work, NOT the load-bearing strength lifts.
- **Morning flow MUST rotate every week** (see Morning Flow Design) — swap ~half the moves, keep the rehab anchors, cycle older favorites back.
- **Variety is cheap on KB / flow / morning days, expensive on gym days** — rotate freely on the former; on gym days respect the time budget + station grouping (rotate *within* a station, don't fragment it).

## Personalized Program Context

When building or modifying workouts for the functional-bulk-dynamic program (or any personalized workout), **always check `NOTES.md`** for session observations, planned progressions, exercise ideas, and equipment notes from prior weeks. These notes capture decisions and context that don't live in the workout JSON files.

## Look Up the Canonical Source Before You Guess — REQUIRED

**Before reconstructing anything that already exists in the repo, find and read its canonical source. Never rebuild it from memory.** Reconstructing-from-memory is how pieces get silently dropped, reordered, or relabeled — and the error then propagates forward week after week because each new week is built off the last. This is a hard rule, not a preference.

**Flows are atomic, canonical units with a single source of truth — REFERENCE them, never re-type them.** As of W17 there is a flow architecture (see NOTES.md "Flow architecture"): a flow bundle defines its moves ONCE in a top-level `flowSequence: [{id, notes}, ...]` (plus `source`, `sourceUrl`, `flowNotes`, `tips`), and a weekly workout references it with a single set `{ "type": "flow", "flowId": "<bundle-id>", "rounds": N, "notes": "<weekly load/spotlight framing>" }`. `static/generator.js` resolves the `flowId` → renders the moves inline + a "view full flow" link with the source citation. **Do NOT re-list the moves in the weekly file.** Dropping, adding, or reordering a move breaks the flow — and there's no longer any reason to, since the weekly file doesn't contain the moves.

**Use this architecture for every NEW or reworked flow** (a `flowSequence` bundle + `flowId` references). The legacy flows below predate it and are still inlined in weekly files — **that's fine, leave them as-is; no need to migrate them proactively.** If you happen to be reworking one anyway, converting it is a nice-to-have, not a requirement. Canonical flow files:
- **Leggy Flow** → `workouts/kettlebell/kb-leggy-flow.json` — dead clean → curtsy lunge → lateral lunge → lateral squat clean → lateral lunge → tactical clean (lower-body cousin of the Bent Press Flow, no overhead; in the program since W17 Tuesday). **On the `flowSequence` architecture — reference it via `flowId`.**
- **Bent Press Flow** → `workouts/kettlebell/kb-flow-dead-clean-press.json` — dead clean → front squat → lateral lunge → bent press → tactical clean (in the program since W4). **Formerly called the "OTD flow"** — same flow, renamed W17 for clarity; every "OTD flow" reference in older workouts/logs/program notes points here. *(Legacy — inlined in weekly files, fine as-is.)*
- **Figure-8 → tactical clean** → `workouts/kettlebell/kb-figure-8-tactical-clean-complex.json` *(legacy inline — fine as-is)*
- **Asgooch overhead mobility complex** → `workouts/kettlebell/kb-overhead-mobility-complex.json` *(legacy inline — fine as-is)*
- **B-stance flow** → `workouts/kettlebell/kb-b-stance-flow.json` *(legacy inline — fine as-is)*

What went wrong before the architecture (the cautionary tale): the bent press was move #4 of the OTD flow for 8 weeks (W4–W12); W13 pulled it out into a separate block (flow degraded to 4 moves); W14 lost it entirely; and a hasty "fix" re-added it in the wrong slot. All because the flow was re-typed each week. The `flowSequence`/`flowId` architecture exists precisely so this can't happen again — the weekly file references the bundle instead of containing a copy.

**Generalize beyond flows.** Whenever you're about to assert "this exercise is X" / "the equipment is Y" / "the sequence is Z" / "there's no canonical file for this" — first `grep`/`rg` the repo and read the actual definition (`exercises/*.json`, `workouts/kettlebell/*.json`, `progressions/*.json`, `NOTES.md`, the form-cues doc). If you catch yourself guessing, stop and look it up. A wrong "there's no canonical file" answer is worse than saying "let me check."

## Weekly Workout Generation

When generating a new week's workout files, **every exercise note must be fresh and specific to that week**. Do NOT carry forward stale notes from previous weeks. Each exercise note should reference:
- The most recent session log actuals (what weight/reps were actually done)
- Any form corrections or observations from the prior week
- The specific target for THIS week (not copy-pasted from last week)
- Context from NOTES.md (equipment swaps, shoulder status, form focus, etc.)

Bad: "W5: first attempt at 30. If W5 was solid, push for 5 reps per side."
Good: "W7 form check: 25lb at home, 30lb at gym. W6 actuals: 30x5 each side solid. Stay at 30, focus on clean path. Right shoulder still crackly — stop if it flares."

**Cross-reference prior logs and workouts before writing — REQUIRED:** Before writing notes/cues for any exercise in a new week's workout, **read the last 2-3 session logs for that exercise** (`programs/logs/functional-bulk-dynamic-w*.json`) to confirm:
- **Equipment** — cable column vs Kinesis vs DB vs machine. Equipment switches persist (e.g., W9 deload moved cable lat raise, incline tri, and straight arm pulldown to Kinesis — all stayed there). Don't re-introduce a stale setup just because earlier weeks used it.
- **Working weight scale** — Kinesis numbers (1-10ish or 100-style) vs cable column lb vs DB lb are different scales. Don't quote a cable-column lb when the user is on Kinesis.
- **Movement variant** — kneeling vs standing vs incline bench vs seated. Cues that assume the wrong setup are the #1 source of "these descriptions are off."
- **Recurring observations** — shoulder/pec status, swaps, "behind body / line of pull doesn't apply here" type feedback.

Default workflow before writing W{N} cues: `grep -A4 "<exercise-id>" programs/logs/functional-bulk-dynamic-w*.json` and read the most recent 2-3 entries. If equipment differs from the form-cues reference doc, **fix the reference doc too** so the same mistake doesn't repeat next week.

**Exercise count discipline:** When adding a new exercise, ALWAYS remove or replace an existing one — don't just add on top. Workouts should stay roughly the same length week to week. If experimenting with something new, ask the user what to drop. If unsure, propose the swap explicitly ("add X, drop Y — ok?"). The pull day getting too long in W7 is what happens when we keep adding without trimming.

## Workout Files Are the Prescription, Not Scratch Notes

Workout JSON files (`workouts/`) and program files are the **interface the user reads to train**. Write every `notes`, `description`, `theme`, `watchpoints`, and `tips` field like a real report or a menu — the prescription only: loads, sets/reps, cues, reflection prompts.

**Do NOT write scratch / program-management notes in them.** Specifically banned inside workout and program files:
- "HOLD" / "confirmed" / "actual working weight" bookkeeping
- Parenthetical justification for *why* a load was chosen ("22.5 doesn't exist at this gym", "W12 said it had headroom")
- Week-by-week history ("W12D5 discovery", "spotlight was W10", "the workout used to describe this wrong")
- Edit changelog ("X was removed", "originally added but cut")
- Future-planning chatter ("that's a W14 decision", "W14 can build this out")
- Set counts framed as a delta ("3 sets, NOT 4" → just write "3 sets")

All of that — load rationale, equipment history, edit context, design intent, rotation planning — lives in `NOTES.md`, the session logs, or commit messages. **Cues and reflection prompts stay; bookkeeping goes.** If the user reads a sentence and it tells them nothing about what to do right now, it does not belong in the file.

## Station Grouping in Multi-Equipment Workouts

When designing a weekly workout, **sequence consecutive exercises so they share a physical station / piece of equipment.** The user trains in a real gym with finite machines, and walking back to a station for one more exercise costs time and breaks the flow. The `feedback_station_focused_workouts` memory says this; treat it as a hard sequencing rule, not a stylistic preference.

**Concrete cases that come up:**
- **Calf raise on the leg press machine** (`leg-press-calf-raise`) belongs **immediately after leg press**, NOT after Bulgarian / lunges / other stations. Same machine = adjacent in the workout. (W13D5 user flag: "calf raise is in a bad position it needs to be with the equipment.")
- **Cable column lifts** (lat pulldown, face pull, cable crunch, straight-arm pulldown, cable lateral raise, incline cable tri ext) cluster together — don't scatter across the workout.
- **Kinesis cable** lifts cluster together — and are kept separate from cable column lifts (different machines, different stack scales).
- **Bench-based lifts** (incline DB press, chest-supported row, incline curl, incline RDL) cluster around the adjustable benches.
- **Smith machine / squat rack** lifts (squat, push press, Bulgarian on Smith, behind-back shrugs) cluster around the rack.

**The check before finalizing a weekly workout JSON:** read down the `sets[]` order and ask "if I'm at the previous exercise's station, is the next exercise at the same station or right next to it?" If the user has to walk back and forth across the gym mid-session, re-order. **Spotlight rotation does NOT override station grouping** — put the spotlight in the right station slot, then make the slot the spotlight.

If two grouping constraints conflict (e.g., a spotlight lift wants to come early, but its station is in the middle of the flow), the station-grouping wins for the body of the workout — adjust the spotlight callout in `dayOverview` instead of fragmenting the sequence.

## Equipment Variant Tracking (W14+)

Many lifts can be done on multiple pieces of equipment at the user's gym — cable column vs. cable pulley vs. Kinesis vs. dedicated machine. The numbers **don't convert directly** — different stack scales, different leverage (e.g. the rope cable-crunch works at ~67.5-77.5, but the *same* movement on the cable column is ~270 — the pulley's mechanical advantage is huge).

**The station a lift is done on genuinely MOVES week to week — because of availability. People camp on stations, so the user takes whatever's free.** This is expected reality, NOT drift. It has two consequences the agent must internalize:

- **A lift having several station options is correct — never collapse it to one "default."** List EVERY real station with its own number and have the user log which he used. The multi-listing is the feature, not the bug.
- **The drift to hunt is a *wrong or fabricated per-station number*, or a number labeled with the wrong station** (a rope-pulley 67.5 written as "cable column 67.5") — not the fact that the lift moves around. If a listed station has **no log datapoint**, it's probably fabricated — audit it (`deno task audit <lift>`) and drop it. See the W23D3 drift audit in NOTES.md.

The workout has to anticipate this and so do the logs:

**Three rules:**

**1. Workout JSON load notes list a number per equipment option.** When a lift has multiple equipment options, the `notes` field gives a number for *each* one — not just the default with a fallback aside. Format:

```
**LOAD:**
- Regular lat pulldown machine: 140
- Cable column: 52.5-57.5
- Cable pulley: 47.5
Pick whichever's free; **note which equipment + number you used in the log.**
```

The user shouldn't have to guess what "the equivalent" is on a different machine. Pre-populate.

**2. Session logs always record equipment + number, not just number.** Every `exercises[].sets[]` entry that's on a cable lift gets an `equipment` field naming which machine was used, and the `weight` field has the number on *that* machine's scale. The set-by-set `equipment` field is fine when it varies; the lift-level field on the exercise object is fine when it's consistent across sets.

Bad: `{ "weight": "47.5", "reps": "8-10" }` for a lat pulldown — no machine context, future cross-reference is broken.
Good: `{ "weight": "47.5", "equipment": "cable pulley", "reps": "8-10" }`.

**3. The Equipment Calibration Table in NOTES.md is the cross-equipment source of truth.** When a lift gets done on a NEW variant for the first time, add the new entry to the table. When a working number updates on an existing variant, edit that line. The table is the reference the next weekly workout pulls from. If the table is wrong, fix it before writing the next week.

**Default equipment per lift (current as of W14):**
- Lat raise (cable variant) — **Kinesis** (swapped W9)
- Straight-arm pulldown — **Kinesis** (swapped W9)
- Incline overhead tri ext — **cable column 70**, Kinesis 5 fallback
- Cable fly — **Kinesis** (established since W7)
- Lat pulldown — **regular machine 140**, cable column / cable pulley fallbacks
- Cable crunch + face pull + high cable curl — **cable column** primary

When the default is occupied, the workout's load notes give the fallback number explicitly. The user picks based on what's free.

## Form Cues + Spotlight Rotation (W10+)

The functional-bulk-dynamic program is **form-first**, not bodybuilder-sprint. See `NOTES.md` "Program Philosophy" section at the top of the file for the full framing — modern 2026 cues, joint stacking, ROM/tempo as progressions, "build decades not weeks." This drives every workout design.

**Form cues reference doc:** `docs/notes/functional-bulk/form-cues-2026.md` — reusable per-exercise cues organized as Setup → Movement → Tempo/breath → Common faults → Notes from real sessions. Cite this from weekly workouts; don't re-derive cues from scratch each week.

**Spotlight rotation:** Each weekly workout designates **1-2 "spotlight" lifts per gym day**. Spotlights get the deep cue treatment in their `notes` field (4-6 cues + a reflection prompt, marked with 🔆). Other lifts get 2-3 sharp cues only. Cycle through ~3-4 weeks per push/pull/legs day so every lift gets focused drilling without overload. The rotation tracker in `form-cues-2026.md` shows which lifts are spotlights when.

**`dayOverview` field on each workout JSON:** Top-level field with `theme`, `spotlights[]` (each with `exerciseId` + `why`), `rotationPlan` (which lifts spotlight in upcoming weeks), and `watchpoints[]`. Surfaces the design intent for the day.

## Intensity Tags — Near-Failure vs Cue-Capped (W20+)

The program is form-first, NOT failure-chasing — but the user asked (W19, confirmed 2026-07-05) to know *before* a session which lifts are OK to push near failure and which to keep shy. **Tag every gym-day lift** in the `dayOverview` (a `watchpoints[]` line or a per-lift marker) as one of:

- **🔥 near-failure last set OK** — safe **isolation / machine** lifts where form doesn't degrade dangerously at the limit: leg curl, leg extension, calf raise, cable curl, cable crunch, machine chest/row, leg press. On these, occasionally taking the **last** working set to ~0-1 RIR is a fine intensity bump.
- **🛑 keep it shy — the cue is the cap** — **compound / overhead / spinal-loaded / grip-limited** lifts: squat, RDL, overhead press, push press, pull-up, rows, bent press, anything shoulder-loaded. Here "effort" = the cue holding at a hard load/ROM; the honest ceiling is the rep where the cue breaks (shoulders shrug up, spine rounds, depth shortens, grip fails). Never grind these to a stall.

**The escalation order when a lift feels too easy (bake this into the framing, not just the tag):** (1) **form lever first** — slower eccentric, deeper ROM, pause at the hard point (this is the program's actual progression engine, and it builds full-ROM / stretched-position strength); (2) **load nudge** — the fuzzy floor-rising path; (3) **near-failure last set — only on the 🔥 lifts, and by pushing the existing last set, NOT adding a round** (adds no session length, keeps intensity where form is safe). "Too easy" is usually the floor rising (a success), so reach for the form lever before reaching for more sets. Classify any new lift by the same principle: safe isolation/machine → 🔥; compound/overhead/spinal/grip-limited → 🛑.

**Cue formatting:** Bullet lists with **bold** key terms. NOT paragraph blocks (those got hard to scan). Embed bullets directly in the exercise `notes` field with `\n- ` line breaks.

**Refresh cadence — REMINDER:** After ~2 weeks of new spotlight lifts (so every ~W12, W14, W16 etc. for push, and the equivalent for pull/legs), revisit `docs/notes/functional-bulk/form-cues-2026.md` and update the "Notes from real sessions" subsection for the lifts that just rotated through spotlight. Capture what cue clicked, what failed, what was a surprise. The reference doc is meant to evolve from real session data, not stay static. If the user goes through a spotlight rotation without the reference doc getting updated, prompt them — that's the whole point of rotating.

## Session Logging

When logging gym day sessions from conversation:

- **Cardio default:** Unless noted otherwise, every Arrilaga gym session includes a 12 min zone 2 run to the gym + 12 min zone 2 run back. Always include this in the log `cardio` field.
- **KB days:** Light-touch logging — just note the KB weight used and general feel. No set-by-set tracking needed.
- **Gym days (Push/Pull/Legs):** Track sets, reps, and working weights per exercise. Note any swaps and equipment used.

**Read context BEFORE writing — REQUIRED (skip anything already in conversation context):** Before logging any session, load the full surrounding context. Without this grounding I drift, hallucinate equipment, and turn the user's tentative speculation into confident "findings." Read (only what isn't already loaded):
- **The entire prior 2 weeks of workouts** — all of `workouts/functional-bulk/fb-w{N-1}-*.json` and `fb-w{N-2}-*.json` (push, pull, legs, KB, morning flows). The week is a unit; cross-day context matters (e.g., yesterday's pull affects today's push fatigue).
- **This week's workout JSON** — know what was prescribed for the day being logged.
- **The last 2 weeks' session logs** — `programs/logs/functional-bulk-dynamic-w{N-1,N-2}.json`. Know what's normal vs surprising for these exercises. If chest press 165 cratered today, check whether 165 always craters in set 4 before writing "big finding."
- **`NOTES.md`** — session observations, equipment swaps, shoulder status, planned progressions. The decisions that don't live in JSON.
- **`docs/notes/functional-bulk/form-cues-2026.md`** — established equipment defaults and prior-session notes per exercise.
- **Any other relevant `docs/notes/` files** if the session touches a topic covered there (e.g., a discussion note about a specific exercise or training principle).

**Save the user's raw input verbatim:** Every session log entry MUST include a `rawInput` field with the user's exact message text. The structured `exercises` array is derived from it; `rawInput` is the source of truth. This prevents my paraphrase from becoming the canonical record (and the source of next week's drift).

**Don't editorialize beyond the evidence:**
- Quote the user's actual words and uncertainty. If they wrote "i think it was bc it was at the end?" the log should say "user wondered if it was because it came at the end" — NOT "Lesson: place spotlight earlier."
- One data point + user speculation ≠ a finding. If a theory is worth testing, frame it as a question for next week.
- Keep the `notes` field short (1-3 sentences). Heavy analytical framing belongs in NOTES.md if anywhere, not in the log.

**Editing the form-cues reference doc:** When adding new info (e.g., a new equipment calibration), append it as a NEW line or short subsection. DO NOT rewrite the existing equipment paragraph just to insert one new fact — that creates restated boilerplate ("Default is the cable column for most of the program") that pads the doc and buries the new signal.

## Discussion Notes

When the user shares training articles, tweets, or research for discussion:

1. Create a markdown file in `docs/notes/` with a descriptive slug (e.g., `barbells-vs-machines.md`)
2. Include: date, source URL/attribution, summary of the argument, discussion/analysis, and application to the user's program
3. Keep notes conversational but structured — these are living references, not academic papers
