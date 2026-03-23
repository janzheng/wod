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

## Session Logging

When logging gym day sessions from conversation:

- **Cardio default:** Unless noted otherwise, every Arrilaga gym session includes a 12 min zone 2 run to the gym + 12 min zone 2 run back. Always include this in the log `cardio` field.
- **KB days:** Light-touch logging — just note the KB weight used and general feel. No set-by-set tracking needed.
- **Gym days (Push/Pull/Legs):** Track sets, reps, and working weights per exercise. Note any swaps and equipment used.

## Discussion Notes

When the user shares training articles, tweets, or research for discussion:

1. Create a markdown file in `docs/notes/` with a descriptive slug (e.g., `barbells-vs-machines.md`)
2. Include: date, source URL/attribution, summary of the argument, discussion/analysis, and application to the user's program
3. Keep notes conversational but structured — these are living references, not academic papers
