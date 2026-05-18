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

## Deload Cadence (W13+)

**3 hard / 1 deload, locked from W13 forward.** Next deload weeks: W13, W17, W21. The W9 → W13 spacing sets the pattern.

**Deload week structure:**
- HOLD all loads (no progression, no PR attempts)
- CUT volume to ~60-70%: typically drop a set per exercise (3→2) OR drop reps (10→6-8). Pick one lever per exercise.
- Keep NEW lifts at their introduction volume (don't escalate during a deload)
- Morning flows stay
- Sunday long flow encouraged
- End-of-session cool-down stays (permanent every-gym-day)

When generating a deload week, write `dayOverview.theme` to explicitly call out it's a deload + what fatigue signals motivated it.

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
- **Variety across the week** — different movements each day, rotate in new exercises so it stays interesting.

## Personalized Program Context

When building or modifying workouts for the functional-bulk-dynamic program (or any personalized workout), **always check `NOTES.md`** for session observations, planned progressions, exercise ideas, and equipment notes from prior weeks. These notes capture decisions and context that don't live in the workout JSON files.

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

## Form Cues + Spotlight Rotation (W10+)

The functional-bulk-dynamic program is **form-first**, not bodybuilder-sprint. See `NOTES.md` "Program Philosophy" section at the top of the file for the full framing — modern 2026 cues, joint stacking, ROM/tempo as progressions, "build decades not weeks." This drives every workout design.

**Form cues reference doc:** `docs/notes/functional-bulk/form-cues-2026.md` — reusable per-exercise cues organized as Setup → Movement → Tempo/breath → Common faults → Notes from real sessions. Cite this from weekly workouts; don't re-derive cues from scratch each week.

**Spotlight rotation:** Each weekly workout designates **1-2 "spotlight" lifts per gym day**. Spotlights get the deep cue treatment in their `notes` field (4-6 cues + a reflection prompt, marked with 🔆). Other lifts get 2-3 sharp cues only. Cycle through ~3-4 weeks per push/pull/legs day so every lift gets focused drilling without overload. The rotation tracker in `form-cues-2026.md` shows which lifts are spotlights when.

**`dayOverview` field on each workout JSON:** Top-level field with `theme`, `spotlights[]` (each with `exerciseId` + `why`), `rotationPlan` (which lifts spotlight in upcoming weeks), and `watchpoints[]`. Surfaces the design intent for the day.

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
