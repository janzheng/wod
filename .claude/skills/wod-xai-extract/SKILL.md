---
name: wod-xai-extract
description: Extract structured workout data from X/Twitter posts using Grok's video understanding via coverflow. Use when processing tweet URLs to extract exercises, circuits, and workout structures.
allowed-tools: mcp__deno-hub__coverflow_workflow_run mcp__deno-hub__coverflow_workflow_search Read Write Bash Glob
metadata:
  author: janzheng
  version: "1.0"
---

# WOD X/Twitter Workout Extraction

Extract structured workout routines from X/Twitter posts using Grok's (xAI) video understanding. Outputs JSON with exercises, circuits, sequences, equipment, muscles, and confidence scores.

## When to Use

- Extract workout data from a tweet/X post URL
- Process X/Twitter video content showing exercises
- User mentions "extract from twitter", "pull workout from tweet", "xai extract"

## How It Works

This skill proxies the `xai-twitter-workout-extract` coverflow workflow which uses Grok with X search and video understanding.

## Usage

### Extract from a tweet URL

```
mcp__deno-hub__coverflow_workflow_run with args: "xai-twitter-workout-extract --quiet --url=TWEET_URL --handle=HANDLE"
```

**Parameters:**
- `--url` — The full tweet URL (e.g. `https://x.com/Asgooch/status/2021254033797734405`)
- `--handle` — Twitter handle without @ (e.g. `Asgooch`)

### Save output to a file

```
mcp__deno-hub__coverflow_workflow_run with args: "xai-twitter-workout-extract --quiet --url=TWEET_URL --handle=HANDLE --outputDir=/Users/janzheng/conductor/workspaces/wod/san-jose/workouts/extracted"
```

## Output Schema

Returns JSON with:
- `id` — unique slug
- `name` — descriptive workout name
- `type` — calisthenics, weights, cardio, yoga, etc.
- `source` — platform, url, creator, capturedAt
- `exercises[]` — name, reps, duration, description, notes
- `circuit` — rounds, rest periods (if applicable)
- `sequence` — flow info (if applicable)
- `raw` — transcript, caption, text overlays, visual summary
- `confidence` — overall confidence and uncertainties

## Post-Processing Workflow

After extraction:
1. Review the JSON output for accuracy
2. Move to appropriate workout directory (`workouts/kettlebell/`, `workouts/gym/`, etc.)
3. Adapt to WOD workout schema (sets, exercises with IDs matching `exercises/*.json`)
4. Add exercise-specific media if the video shows clear exercise demos
5. Run `deno task build:exercises` if exercises were updated

## Example

```bash
# Extract @Asgooch's KB complex
mcp__deno-hub__coverflow_workflow_run with args: "xai-twitter-workout-extract --quiet --url=https://x.com/Asgooch/status/2021254033797734405 --handle=Asgooch"
```
