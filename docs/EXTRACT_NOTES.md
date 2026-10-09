# Extraction Notes & Learnings

Running document for patterns, issues, and learnings from extracting workout content.

---

## Common Issues

*Will populate as patterns emerge*

---

## Platform-Specific Notes

### Twitter/X (Grok extraction)
- Text overlays are usually reliable - Grok reads them well
- Captions often have the key workout parameters (rounds, reps, rest)

### Instagram
- *Notes will be added as we extract from Instagram*

### TikTok
- *Notes will be added as we extract from TikTok*

### YouTube
- *Notes will be added as we extract from YouTube*

---

## Exercise Name Mappings

Common misnames or variations → standardized names:

| Extracted As | Should Be | Notes |
|--------------|-----------|-------|
| *will populate* | | |

---

## Things to Watch For

- Rest periods: Could be between exercises OR between rounds - check context
- "Each side" vs total reps - clarify when exercises are unilateral
- Duration vs reps - some exercises use time, others use counts

---

## Caption OCR — Read Overlays Frame By Frame

Small video models (Gemini 2.5 Flash, Nemotron Nano Omni) reliably get the *structure* of a reel but misread burned-in caption text from compressed video — rep counts off by one, a word dropped, a whole beat missed. Conti kickstand complex (2026-08-20): "5 rows" read as 6, "3 strict presses" missed entirely. Same failure on the Outside Snatch reel in July with Gemini. The same model reads the same captions near-perfectly from full-width stills.

`video-workout-extract` now samples the video to individual 540px frames at **2 fps** (`ffmpeg-video/extractFrames`), reads the caption on each one (`sparks/inferBatch`, concurrent), and injects the resulting caption track into the analysis prompt as ground truth. 1 fps is not enough — it missed `tactical clean` and `inside rack` on the outside-snatch reel, both of which flash by in under a second. Budget ~2 min per reel. Results (2026-08-22), both matching hand-verified ground truth:

| Reel | Video-only read | Caption track @ 2 fps |
|------|-----------------|----------------------|
| Conti kickstand complex | 6 rows, press beat missing | 5-4-3-2 exact |
| Outside snatch flow | 6 of 12 beats | 12 of 12 beats |

**Tiling frames into one contact sheet does not work** — tried and removed. The gateway sends images as base64 under a 2 MB request cap, so fitting enough frames to catch a one-second caption forces the tiles below legibility. A 3-second sampling interval also skips captions that only hold for a second, which is how the outside-snatch reel lost `figure 8`, `viking press`, and `switch swing`.

**Single-word OCR variance is handled by voting.** Adjacent frames showing one caption sometimes disagree ("wind" for "windmill", "pork" for "park" — that reel's font has a very round `a`), so `inferBatch` collapses runs of near-identical reads and lets the run vote on the wording. More frames means a bigger vote, which is the second reason 2 fps beats 1 fps: at 1 fps "pork" won, at 2 fps "park" did.

**A single garbled frame in the middle of a caption is dropped.** Voting only helps inside a run; a bad frame that reads *differently enough* splits one caption into three entries — reel 2 produced `switch swing / switching / switch swing`. `inferBatch` discards a one-frame answer when the same caption sits directly on both sides (no blank between) and the intruder opens with at least half of it. The shared-prefix test is what makes this safe: a garbled read keeps the opening glyphs and mangles the rest ("switching" holds all six characters of "switch"), while two real beats diverge immediately ("swing" shares one character with "snatch"). Edit distance cannot separate those — both are about four edits.

**The extractor still does not know which captions are moves.** It faithfully lists every one, so non-movement beats ("inside rack" is a position, "repeat on other side" is an instruction) arrive in `exercises[]` and get resolved during import, not by the model. Always read `workout.raw.textOverlays` against `exercises[]` before building anything.

The caption read is also available on its own as **`video-caption-track`** — any video URL in, caption sequence + per-frame transcript out, no workout schema. Handy for checking what a reel says before doing a full extraction.

Also: keep yt-dlp current (`pip3 install -U yt-dlp`) — a stale extractor fails Facebook with `Cannot parse data`. A `Connection to www.facebook.com timed out` is usually just the local network being down.

## Extraction Quality Patterns

### High confidence indicators
- Text overlays match spoken/written content
- Standard exercise names used
- Clear rep/set/round structure

### Low confidence indicators
- Exercise names are creative/branded (may need standardization)
- No audio, relying only on visuals
- Complex flows without clear structure

---

## Updates Log

| Date | Note |
|------|------|
| 2025-02-05 | Created initial notes structure |
| 2026-08-22 | Per-frame caption OCR (extractFrames + inferBatch w/ run voting) added to video-workout-extract; contact-sheet approach tried and removed |
