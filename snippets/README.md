# Snippets Library

This folder contains exercise demos, short routines, and technique guides extracted from social media (Instagram, TikTok, YouTube, Twitter).

These are **reference materials** - not complete workouts, but useful for:
- Learning new exercises
- Finding mobility/flexibility routines
- Understanding equipment usage
- Discovering exercise progressions

## Folder Structure

```
snippets/
├── mobility/       # Hip openers, shoulder mobility, spine work
├── warmups/        # Pre-workout activation, dynamic stretches
├── techniques/     # Form guides, exercise tutorials, cues
├── machines/       # Cable machine, smith machine variations
├── yoga/           # Poses, sequences, flows
├── recovery/       # Cool-down, foam rolling, stretching
└── progressions/   # Exercise progressions/regressions
```

## How to Add Snippets

1. Use the prompt in `EXTRACT_SCHEMA.md` with a VLM (GPT-4V, Claude, Gemini)
2. Paste the video URL and run extraction
3. Save the JSON output to the appropriate category folder
4. Name the file descriptively: `hip-mobility-4-moves.json`

## Schema Quick Reference

```json
{
  "id": "slug-name",
  "type": "exercise | sequence | demo | variations",
  "name": "Display Name",
  "source": {
    "platform": "instagram",
    "url": "https://...",
    "creator": "@handle"
  },
  "tags": ["mobility", "hips"],
  "equipment": ["none"],
  "exercises": [
    { "name": "Exercise", "duration": 30, "notes": "Form cues" }
  ]
}
```

## Using Snippets

Snippets can be:
- Browsed for reference while working out
- Added to custom workout sets
- Used as warmup/cooldown templates
- Studied for technique improvement
