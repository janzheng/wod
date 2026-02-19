---
name: wod-imagegen
description: Generate minimalist workout exercise images using Google Gemini API. Creates consistent coral/peach flat-color illustrations for exercises. Use when creating new exercise images, modifying existing ones, or batch generating workout visuals.
allowed-tools: Bash Read Write Glob
compatibility: Requires GEMINI_API_KEY environment variable
metadata:
  author: janzheng
  version: "1.1"
---

# WOD Image Generation

Generate minimalist workout exercise images using Google's Gemini API. Produces consistent coral/peach flat-color illustrations matching the WOD app aesthetic.

## When to Use

- Create a new exercise image based on an existing reference
- Update/regenerate exercise images with consistent style
- Batch process multiple images
- User mentions "generate image", "create workout image", "make exercise illustration"

## Quick Start

```bash
cd /Users/janzheng/conductor/workspaces/wod/san-jose

# Generate from exercise JSON as JPG (recommended)
deno run -A .claude/skills/wod-imagegen/generate.ts --exercise barre-bent-leg-side-lift --no-ref --jpg

# With custom quality (1-100, default 80)
deno run -A .claude/skills/wod-imagegen/generate.ts --exercise bird-dog --no-ref --jpg --quality 60

# Or with custom prompt
deno run -A .claude/skills/wod-imagegen/generate.ts \
  --output static/new-images/fire-hydrant.png \
  --prompt "Fire Hydrant: On all fours, lift bent knee out to the side" \
  --jpg
```

## Prerequisites

1. Get API key from https://aistudio.google.com/apikey
2. Create `apps/wod/.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Usage Examples

### Generate Single Image

Always provide a reference image for style consistency:

```bash
deno run -A .claude/skills/wod-imagegen/generate.ts \
  --reference static/images/barre-clamshell.png \
  --output static/images/side-lying-leg-raise.png \
  --prompt "person lying on side, lifting top leg straight up"
```

### JPG Output (Recommended)

Use `--jpg` to convert output to JPG for smaller file sizes (~70-80% reduction):

```bash
# Default quality (80)
deno run -A .claude/skills/wod-imagegen/generate.ts --exercise bird-dog --no-ref --jpg

# Lower quality for smaller files
deno run -A .claude/skills/wod-imagegen/generate.ts --exercise bird-dog --no-ref --jpg --quality 60
```

Uses macOS `sips` for conversion. PNG is automatically removed after conversion.

### Custom Style Override

```bash
deno run -A .claude/skills/wod-imagegen/generate.ts \
  --output static/images/new.png \
  --prompt "your custom prompt" \
  --style "photorealistic fitness photo, gym background" \
  --jpg
```

### List Available Reference Images

```bash
ls apps/wod/static/images/*.png | head -20
```

## WOD Style

The default style produces warm coral/peach illustrations matching the WOD app aesthetic:

### Color Palette (Hex) - Flat Solid Colors
| Element | Color | Notes |
|---------|-------|-------|
| Skin | `#F7DCC9` | Single flat peachy-beige, NO gradients/shading |
| Hair | `#C97B62` | Flat auburn with simple `#D4896F` highlight streaks |
| Clothes | `#E9A090` | Flat dusty coral, one solid color per garment |
| Outlines | `#D49080` | Soft terracotta, thin and delicate |

### Style Details
- **Colors**: FLAT SOLID FILLS only - cel-shaded/vector style
- **Skin**: Uniform single color, NO blotches/gradients/texture
- **Hands**: Defined fingers (not blobs)
- **Hair**: Simple strand lines
- **Clothes**: Sports bra + shorts with fold lines (not color variation)
- **Lines**: Thin, elegant strokes throughout
- **Figure**: Faceless (no facial features)
- **Background**: Pure white, NO floor/ground line, NO shadows

Default prompt (can be overridden with `--style`):

```
Minimalist fitness illustration with flat, solid colors (cel-shaded style):

Color palette - use FLAT SOLID FILLS, no gradients or texture:
- Skin: single flat peachy-beige (#F7DCC9) - ONE solid color, NO blotches, NO gradients, NO shading
- Hair: flat muted auburn (#C97B62) with simple highlight streaks (#D4896F)
- Clothes: flat dusty coral (#E9A090) sports bra and shorts - ONE solid color per garment
- Outlines: soft terracotta lines (#D49080) - thin and delicate

CRITICAL style requirements:
- FLAT COLORS ONLY - skin must be one uniform solid color with no variation
- NO gradients, NO shading, NO blotchy textures on skin or clothes
- Clean cel-shaded/vector illustration style
- Hands with defined fingers (not blob hands)
- Hair with simple strand lines
- Clothes with simple fold lines (not color variation)
- Thin, elegant line work throughout
- Faceless figure (no facial features, just head shape)
- Pure white background ONLY - NO floor line, NO ground line, NO shadows
- Figure floats in empty white space

Do NOT include: text, labels, watermarks, ground lines, skin texture, color gradients, or shading.
```

## API Details

- **Model**: `gemini-3-pro-image-preview`
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent`
- **Auth**: API key as query parameter (`?key=...`)

## Workflow for New Exercise

1. **Generate** - Run with `--no-ref --jpg` for text-only generation
2. **Critique** - Review output for common defects (see checklist below)
3. **Iterate** - If defects found, refine prompt and regenerate
4. **Save** - Update exercise JSON with working `imagePrompt` field

## Image Critique Checklist

After generating an image, **always review for these common defects**:

### Pose Accuracy
- [ ] **Correct exercise position** - Does the pose match the exercise description?
- [ ] **Proper joint angles** - Are knees/elbows bent correctly (not hyper-extended)?
- [ ] **Anatomically correct** - No impossible body positions?

### Arm Issues (Common!)
- [ ] **No "T-Rex arms"** - Arms shouldn't be awkwardly bent with palms up
- [ ] **Correct arm position for exercise** - Ballet exercises need proper positions:
  - First position: rounded in front, like holding a beach ball
  - Second position: extended gracefully to sides
  - Hands on hips: for stability exercises
- [ ] **Defined hands** - Fingers visible, not blob hands

### Leg Issues (Common!)
- [ ] **No accidental splits** - Legs bent at knees, not extended into split
- [ ] **Not sitting on ground** - Standing exercises should be STANDING, not seated
- [ ] **Correct stance width** - Wide plié ≠ full splits
- [ ] **Knees tracking over toes** - Proper alignment for squats/pliés

### Figure Issues
- [ ] **Single figure only** - Not multiple figures or progression sequences
- [ ] **Faceless** - No facial features, just blank head shape
- [ ] **Not floating** - Figure should feel grounded (even without floor line)

### Style Consistency
- [ ] **Flat colors** - No gradients or shading on skin/clothes
- [ ] **White background** - No ground lines, shadows, or floor
- [ ] **Correct color palette** - Coral/peach tones matching WOD style

## Prompt Tips for Common Issues

| Issue | Fix |
|-------|-----|
| T-Rex arms | Specify exact arm position: "arms in ballet first position", "hands on hips", "arms at sides" |
| Split legs instead of squat | Add "knees BENT", "NOT a split", "deep squat position" |
| Sitting on ground | Add "STANDING UPRIGHT", "NOT sitting", "NOT on the ground", "FEET FLAT ON GROUND" |
| Multiple figures | Add "Single figure", "ONE person", "only ONE figure" |
| Floating feel | Add "viewed from the front", "standing upright" |
| Wrong pose | Be VERY specific about body position, joint angles, and what NOT to do |

## Exercise JSON: imagePrompt Field

For exercises that need custom prompts, add an `imagePrompt` field:

```json
{
  "id": "barre-wide-plie-lift",
  "name": "Wide Plié Lift",
  "description": "Stand with feet wider than shoulder-width...",
  "imagePrompt": "Single figure doing Wide Plié squat: ONE person standing with feet wider than shoulder-width, toes pointed outward. Deep squat with knees bent tracking over toes. Arms in ballet first position - rounded in front of body at hip level. Viewed from the front."
}
```

The generate script can be extended to use `imagePrompt` when available for better results.

## Troubleshooting

**"API key not configured"**: Create `.env` file with `GEMINI_API_KEY`

**Poor output quality**: Try a different reference image or more specific prompt

**Rate limits**: The API has usage limits - wait and retry
