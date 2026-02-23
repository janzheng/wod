# Coverflow: File I/O for Workflows (Input Files + Output Persistence)

## Context

The `video-workout-extract` workflow downloads videos via yt-dlp, extracts frames with ffmpeg, and sends them to Gemini for analysis. Currently, the video and frames are saved to `{tempDir}` which is **auto-deleted** when the pipeline finishes (line ~724 in `coverflow.ts`).

The workout JSON gets saved to `{outputDir}` via `local/save`, but the source video is lost.

## Current Behavior

```
Pipeline starts
  → Deno.makeTempDir() creates /var/folders/.../coverflow-exec_XXXX/
  → yt-dlp saves video to {tempDir}/video.mp4
  → ffmpeg extracts frames to {tempDir}/frames/
  → Gemini analyzes frames
  → local/save writes workout JSON to {outputDir}/workout-id.json
Pipeline ends
  → Deno.remove(tempDir, { recursive: true })  ← video gone forever
```

## Why We Need This

1. **Facebook/Instagram quirk** — these platforms serve different videos on re-download, so the original video is irreplaceable once deleted
2. **Re-analysis** — run Gemini again with different prompts without re-downloading
3. **Archival** — keep the source video with the extracted data
4. **Offline reference** — view the original content locally

## Proposed Approach: Runner-Level `outputFiles`

File persistence is an **execution/runner concern**, not a pipeline step. It belongs at the same level as `{tempDir}`, `{outputDir}`, and `{executionId}` — infrastructure that the runner manages, not business logic that a module handles.

### Workflow Definition

Workflows declare which temp files to persist using an `outputFiles` config:

```json
{
  "name": "video-workout-extract",
  "outputFiles": [
    "{video.outputPath}",
    "{tempDir}/frames/*.jpg"
  ],
  "pipeline": [...]
}
```

The runner resolves the template variables and glob patterns, then copies matching files to `{outputDir}` right before it nukes `{tempDir}`.

- If `{outputDir}` is set → files are copied there
- If `{outputDir}` is NOT set → files are skipped (same as how `local/save` uses `continueOnError`)
- Glob patterns expand naturally (`*.jpg` copies all frames)

### CLI Usage

```bash
# Save workout JSON + video + frames to the project
workflow:run video-workout-extract \
  --url=https://facebook.com/reel/123 \
  --outputDir=./apps/wod/snippets/kettlebell

# Just the JSON, no video (don't set outputFiles or override)
workflow:run video-workout-extract \
  --url=https://facebook.com/reel/123 \
  --outputDir=./apps/wod/snippets/kettlebell \
  --keepFiles=none
```

### Overrides via CLI

Users should be able to control file persistence per-execution:

```bash
# Keep everything (video + frames + intermediates)
--keepFiles=all

# Keep specific patterns
--keepFiles="video.mp4,frames/*.jpg"

# Keep nothing (default, current behavior)
--keepFiles=none
```

This overrides whatever the workflow's `outputFiles` declares.

### Runner Implementation

In `coverflow.ts`, right before the temp cleanup (line ~724):

```
Pipeline finishes
  → Resolve outputFiles patterns against {tempDir} and storage
  → If {outputDir} exists, copy matching files there
  → Deno.remove(tempDir, { recursive: true })
```

The copy happens in the `finally` block, after all steps complete but before cleanup. Files that fail to copy are logged but don't fail the pipeline.

### Destination Naming

For simple paths like `{video.outputPath}` (which resolves to `/var/folders/.../video.mp4`), the file is copied with its basename: `{outputDir}/video.mp4`.

For glob patterns like `{tempDir}/frames/*.jpg`, files are copied preserving the relative structure: `{outputDir}/frames/frame_001.jpg`, etc.

For custom naming, workflows can use a mapping syntax:

```json
"outputFiles": [
  { "source": "{video.outputPath}", "as": "{workout.id}-source.mp4" },
  { "source": "{tempDir}/frames/*.jpg", "as": "frames/" }
]
```

Both the simple array form (string paths) and the mapping form (source/as objects) should work.

## Also Useful

- **`--keepTempDir`** CLI flag — for debugging, skips the cleanup entirely. Already half-implemented (the runner checks `options.executionDirs?.keepTempDir`), just needs to be wired to the CLI.
- **Return file manifest in metadata** — the pipeline result should list what files were persisted and where, so the caller knows what's available.

```json
{
  "metadata": {
    "persistedFiles": [
      { "source": "{tempDir}/video.mp4", "destination": "{outputDir}/video.mp4", "size": 5560000 },
      { "source": "{tempDir}/frames/frame_001.jpg", "destination": "{outputDir}/frames/frame_001.jpg", "size": 45000 }
    ]
  }
}
```

## Updated video-workout-extract

Once this is implemented, the workflow just adds `outputFiles` at the top level:

```json
{
  "name": "video-workout-extract",
  "description": "Extract workout from any video URL",
  "tags": ["fitness", "video", "gemini", "local-only"],
  "params": ["url"],
  "outputFiles": [
    { "source": "{video.outputPath}", "as": "{workout.id}-source.mp4" }
  ],
  "pipeline": [
    "... (no changes to the 7 existing steps)"
  ]
}
```

No new modules, no extra pipeline steps. The runner handles it.

---

## Input Files: `--inputFiles` and `{inputDir}`

The other half of the file I/O story. When running workflows locally (especially via MCP skills from other projects), you often already have the file on disk. You shouldn't need to download it again or hack around with hardcoded paths.

### The Problem

Right now, `video-workout-extract` always downloads via yt-dlp — even if you already have the video saved locally. And there's no standard way to pass a local file into a workflow. You'd have to either:

1. Hardcode a path in the params: `--url=file:///path/to/video.mp4` (hacky, yt-dlp might not handle it)
2. Manually copy the file into `{tempDir}` before the pipeline runs (impossible from CLI)
3. Skip the download step somehow (no conditional logic in pipelines)

This gets worse with skills. If a Claude session in another project (like accra/wod) wants to run a coverflow workflow on a local file, there's no clean way to pass it through.

### Proposed: `inputFiles` as Runner-Level Config

Just like `outputFiles` and `outputDir`, input files are a runner concern:

```bash
# Pass a local video — skip the download step
workflow:run video-workout-extract \
  --inputFiles="/path/to/my-video.mp4" \
  --outputDir=./apps/wod/snippets/kettlebell

# Pass multiple input files
workflow:run transcribe-and-summarize \
  --inputFiles="/path/to/audio.mp3,/path/to/notes.pdf" \
  --outputDir=./output
```

### How It Works

1. **Runner creates `{inputDir}`** — a read-only staging directory (sibling to `{tempDir}`)
2. **Input files are copied/symlinked into `{inputDir}`** before the pipeline starts
3. **Workflows reference them via `{inputDir}`** — e.g., `{inputDir}/my-video.mp4`
4. **`{inputDir}` is available as a template variable** just like `{tempDir}` and `{outputDir}`

```
Pipeline starts
  → Runner creates {inputDir}, copies/symlinks input files there
  → Runner creates {tempDir}
  → Pipeline steps can reference {inputDir}/filename.mp4
  → ...
Pipeline ends
  → Runner cleans up {tempDir} (and {inputDir} if it was a copy)
```

### Workflow Adaptation

Workflows that support local file input would check for `{inputDir}` first, and fall back to downloading:

```json
{
  "name": "video-workout-extract",
  "params": ["url"],
  "inputFiles": {
    "video": { "extensions": [".mp4", ".mov", ".webm"], "required": false }
  },
  "outputFiles": [
    { "source": "{video.outputPath}", "as": "{workout.id}-source.mp4" }
  ],
  "pipeline": [
    {
      "name": "yt-dlp/downloadVideo",
      "settings": {
        "url": "{{url}}",
        "outputPath": "{tempDir}/video.mp4"
      },
      "save": "video",
      "skipIf": "{inputDir}/video"
    },
    "... rest of pipeline uses {video.outputPath} or {inputDir}/video.mp4"
  ]
}
```

The `skipIf` field is key — if the input file already exists (provided via `--inputFiles`), the download step is skipped entirely. The subsequent steps don't care where the file came from.

### CLI Patterns

```bash
# URL mode (current) — downloads via yt-dlp
workflow:run video-workout-extract --url=https://facebook.com/reel/123

# Local file mode — skips download, uses local file directly
workflow:run video-workout-extract --inputFiles="video=/path/to/saved-reel.mp4"

# Mixed — some files local, some downloaded
workflow:run media-pipeline \
  --inputFiles="audio=/path/to/podcast.mp3" \
  --url=https://youtube.com/watch?v=xxx

# From skills (MCP) — the calling project passes its own file paths
# e.g., accra/wod Claude says:
#   "run video-workout-extract with this local video I already downloaded"
workflow:run video-workout-extract \
  --inputFiles="video=/Users/janzheng/conductor/workspaces/design/accra/apps/wod/downloads/reel.mp4" \
  --outputDir=/Users/janzheng/conductor/workspaces/design/accra/apps/wod/snippets/kettlebell
```

### Named vs Positional Input Files

Two syntaxes for flexibility:

```bash
# Named (maps to workflow's inputFiles config)
--inputFiles="video=/path/to/file.mp4,transcript=/path/to/subs.srt"

# Positional (just dumps files into {inputDir} by basename)
--inputFiles="/path/to/file.mp4,/path/to/subs.srt"
```

Named is better for workflows that declare their expected inputs. Positional is simpler for ad-hoc usage.

### Why This Matters for Skills

When coverflow workflows are invoked via MCP skills from other projects:

1. The calling Claude (in accra/wod) may have already downloaded or generated a file
2. It shouldn't need to upload it to a URL just so the workflow can re-download it
3. Local file paths work because everything runs on the same machine
4. The skill just passes `--inputFiles` with absolute paths from the calling project

This completes the local file I/O story:
- **`{inputDir}` + `--inputFiles`** → get files INTO the workflow
- **`{tempDir}`** → scratch space DURING the workflow
- **`{outputDir}` + `outputFiles`** → get files OUT of the workflow
