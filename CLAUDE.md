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
