---
name: wod-video-extract
description: Extract structured workout data from any video URL (Facebook, Instagram, TikTok, YouTube, etc.) using yt-dlp + NVIDIA Nemotron Nano Omni via coverflow. LOCAL ONLY - requires yt-dlp installed.
allowed-tools: mcp__deno-hub__coverflow_workflow_run mcp__deno-hub__coverflow_workflow_search Read Write Bash Glob
metadata:
  author: janzheng
  version: "1.0"
---

# WOD Video Workout Extraction

Extract structured workout routines from ANY video URL using yt-dlp download + NVIDIA Nemotron Nano Omni self-hosted on the DGX Spark gateway at sparks.labspace.ai (direct video analysis, `routing: local` — the clip never leaves the box). Supports Facebook, Instagram, TikTok, YouTube, and more.

**LOCAL ONLY** — requires yt-dlp installed on the machine.

## When to Use

- Extract workout data from a video URL (any platform)
- Process Facebook reels, Instagram videos, TikTok, YouTube
- User mentions "extract from video", "pull workout from video", "video extract"
- For X/Twitter posts, prefer `wod-xai-extract` instead (uses Grok's native X integration)

## How It Works

This skill proxies the `video-workout-extract` coverflow workflow:
1. Downloads video via yt-dlp
2. Compresses, then uploads the MP4 directly to Nemotron Nano Omni on the Spark as multipart — no base64 step (`SPARKS_API_KEY` in coverflow-v3/.env)
3. Samples the video to 2 fps full-width frames and has Omni read the on-screen caption on each — burned-in text (rep counts, exercise names) is unreadable from compressed video but near-perfect from stills. Runs of near-identical reads vote on wording.
4. The model analyzes the video for exercises, form, reps, etc., with the caption transcript as ground truth
5. Returns structured JSON

**Always check `workout.raw.textOverlays` against `exercises[]` before importing.** The caption track is the ground truth; the model lists every caption faithfully but cannot tell a movement from a position or an instruction, so beats like "inside rack" or "repeat on other side" arrive in `exercises[]` for you to resolve. Expect ~2 min per reel.

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

## Just the Captions

`video-caption-track` is the same caption read without the workout schema — any video, any burned-in text, returns the caption sequence plus a per-frame transcript. Use it to check what a reel actually says before committing to a full extraction, or on non-workout video.

```
mcp__deno-hub__coverflow_workflow_run with args: "video-caption-track --quiet --url=VIDEO_URL"
```

## Supported Platforms

Any URL that yt-dlp supports: YouTube, Facebook, Instagram, TikTok, Twitter/X, Vimeo, Dailymotion, and hundreds more.

## Example

```bash
# Extract from a Facebook reel
mcp__deno-hub__coverflow_workflow_run with args: "video-workout-extract --quiet --url=https://www.facebook.com/reel/1397870815215714 --outputDir=./workouts/extracted"
```
