---
name: wod-video-extract
description: Extract structured workout data from any video URL (Facebook, Instagram, TikTok, YouTube, etc.) using yt-dlp + Gemini vision via coverflow. LOCAL ONLY - requires yt-dlp installed.
allowed-tools: mcp__deno-hub__coverflow_workflow_run mcp__deno-hub__coverflow_workflow_search Read Write Bash Glob
metadata:
  author: janzheng
  version: "1.0"
---

# WOD Video Workout Extraction

Extract structured workout routines from ANY video URL using yt-dlp download + Gemini vision (direct video analysis). Supports Facebook, Instagram, TikTok, YouTube, and more.

**LOCAL ONLY** — requires yt-dlp installed on the machine.

## When to Use

- Extract workout data from a video URL (any platform)
- Process Facebook reels, Instagram videos, TikTok, YouTube
- User mentions "extract from video", "pull workout from video", "video extract"
- For X/Twitter posts, prefer `wod-xai-extract` instead (uses Grok's native X integration)

## How It Works

This skill proxies the `video-workout-extract` coverflow workflow:
1. Downloads video via yt-dlp
2. Base64 encodes and sends to Gemini 2.5 Flash
3. Gemini analyzes the video for exercises, form, reps, etc.
4. Returns structured JSON

## Usage

### Extract from a video URL

```
mcp__deno-hub__coverflow_workflow_run with args: "video-workout-extract --quiet --url=VIDEO_URL"
```

### Save output to project

```
mcp__deno-hub__coverflow_workflow_run with args: "video-workout-extract --quiet --url=VIDEO_URL --outputDir=/Users/janzheng/conductor/workspaces/wod/san-jose/workouts/extracted"
```

### Keep the downloaded video

```
mcp__deno-hub__coverflow_workflow_run with args: "video-workout-extract --quiet --url=VIDEO_URL --outputDir=/Users/janzheng/conductor/workspaces/wod/san-jose/workouts/extracted --keepFiles=all"
```

**Parameters:**
- `--url` — Video URL from any supported platform
- `--outputDir` — Where to save the extracted JSON (optional)
- `--keepFiles=all` — Also save the downloaded video to outputDir

## Output Schema

Returns JSON with:
- `status` — "success"
- `sourceUrl` — original video URL
- `workout` — structured workout data:
  - `id`, `name`, `type`, `source`
  - `exercises[]` — name, reps, duration, description, notes
  - `circuit` / `sequence` — structure info if applicable
  - `raw` — text overlays, visual summary
  - `confidence` — overall and uncertainties
- `metadata` — model used, execution ID, token count

## Post-Processing Workflow

After extraction:
1. Review the JSON output for accuracy
2. Move to appropriate workout directory (`workouts/kettlebell/`, `workouts/gym/`, etc.)
3. Adapt to WOD workout schema (sets, exercises with IDs matching `exercises/*.json`)
4. Add exercise-specific media if the video shows clear exercise demos
5. Run `deno task build:exercises` if exercises were updated

## Supported Platforms

Any URL that yt-dlp supports: YouTube, Facebook, Instagram, TikTok, Twitter/X, Vimeo, Dailymotion, and hundreds more.

## Example

```bash
# Extract from a Facebook reel
mcp__deno-hub__coverflow_workflow_run with args: "video-workout-extract --quiet --url=https://www.facebook.com/reel/1397870815215714 --outputDir=./workouts/extracted"
```
