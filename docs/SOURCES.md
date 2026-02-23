# Content Sources

Tracks where exercises, workouts, and programs come from.

---

## Exercise Library Stats

- **Total exercises:** 494
- **With media/source attribution:** 78 (16%)
- **Without explicit source:** 416 (standard fitness movements, RRR, general knowledge)

### By Type
| Type | Count |
|------|-------|
| calisthenics | 232 |
| weights | 167 |
| barre | 31 |
| plyo | 30 |
| yoga | 15 |
| stretch | 11 |
| rehab | 7 |
| cardio | 1 |

### By Category
| Category | Count |
|----------|-------|
| core | 120 |
| legs-quads | 88 |
| chest | 52 |
| shoulders | 50 |
| legs-hip-hinge | 40 |
| mobility | 33 |
| back-horizontal-pull | 27 |
| back-vertical-pull | 25 |
| full-body | 16 |
| cardio | 16 |
| arms-triceps | 10 |
| arms-biceps | 10 |
| calves | 7 |

---

## Sources

### @KarlApexFit (X/Twitter)
- **URL:** https://x.com/karlapexfit/status/2023359316456271917
- **What:** "65 exercises categorized per muscle group" - comprehensive gym exercise database
- **Import status:** COMPLETE
- **Coverage:** 40/41 exercises already existed, 1 created (incline-bench-dumbbell-row)
- **Extracted to:** `workouts/extracted/karlapexfit-65-exercise-database.json`
- **Also used for:** PPL workout templates (`workouts/gym/ppl-push.json`, `ppl-pull.json`, `ppl-legs.json`)
- **Categories covered:** legs-quads (7), hip-hinge (8), shoulders (8), back-vertical-pull (6), chest (10), back-horizontal-pull (8), arms-triceps (3), arms-biceps (3), calves (4), abs-core (7)
- **Notes:** Post claims 65 but lists ~64 unique exercises. The pasted text starts at category 4 (back); categories 1-3 (legs-quads, hip-hinge, shoulders) were captured separately. All exercises mapped to our existing library. Muscle group data matches our schema.

### @wealthmail (X/Twitter)
- **URLs:** https://x.com/wealthmail/status/2025450838164947031, https://x.com/wealthmail/status/2024846506361028711
- **What:** KB flow combos — overhead extension to halo pyramid, halo to reverse lunge, figure-8 to reverse lunge
- **Import status:** COMPLETE
- **Exercises created:** kettlebell-overhead-extension-to-halo, kettlebell-halo-to-reverse-lunge, kettlebell-figure-8-to-reverse-lunge, kettlebell-figure-8
- **Workouts:** kb-overhead-halo-pyramid; flow combos added to kb-conditioning-blast
- **Notes:** Pyramid finisher (overhead extension). Halo/figure-8 to reverse lunge combos for conditioning. Rotator cuff safety notes on overhead movements.

### @Asgooch (X/Twitter)
- **What:** Kettlebell exercise demos and complexes
- **Import status:** COMPLETE (ongoing - new posts may appear)
- **Exercises with media:** ~20+ kettlebell exercises (goblet squat, swing, clean, press, rows, etc.)
- **Workouts:** kb-athletic-alternating, kb-the-only-workout, kb-overhead-mobility-complex, kb-20-min-full-body, kb-brutal-complex, kb-gym-replacement, kb-beginner-full-body, kb-cardio-complex

### @powerbrutehq (X/Twitter)
- **What:** Kettlebell exercises and leg/core circuits
- **Import status:** COMPLETE
- **Exercises with media:** kettlebell windmill, halo, sumo deadlift, side bend, russian twist, sissy squat
- **Workouts:** kb-core-library, kb-legs-circuit (inspired by)

### @sculptherbody (X/Twitter)
- **What:** Kettlebell lunge and press variations
- **Import status:** COMPLETE
- **Exercises with media:** kettlebell clean-and-press, reverse-lunge-swing, split-stance-pass-through, lunge-snatch, lunge-clean-to-press, lunge

### @gymfiesta (X/Twitter)
- **What:** Kettlebell exercise demos
- **Import status:** COMPLETE
- **Exercises with media:** kettlebell triceps extension, side-swing, halo, row, upright-row, swing, bent-over-horn-row
- **Workouts:** kb-100-rep-daily-challenge

### @metabolicfactor (X/Twitter)
- **What:** Kettlebell flows and complexes
- **Import status:** COMPLETE
- **Exercises with media:** kettlebell around-body-pass, side-swing, high-pull
- **Workouts:** kb-controlled-power-challenge, kb-daily-controlled-power

### @kb_kings / @alexkaru (X/Twitter)
- **What:** Double kettlebell movements
- **Import status:** COMPLETE
- **Exercises with media:** double-kettlebell-snatch, double-kettlebell-swing, double-kettlebell-clean
- **Workouts:** kb-moving-target-complex

### @deanttraining (X/Twitter)
- **What:** Structured hypertrophy programs
- **Import status:** COMPLETE
- **Programs:** 5x hypertrophy split (push/pull/upper/lower-a/lower-b), 4x upper-lower split (upper-a/upper-b/lower-a/lower-b)
- **No individual exercises** - program-level source only

### @actionjacquelyn (YouTube/Social)
- **What:** Barre workouts - 30-day sculpted leg challenge
- **Import status:** COMPLETE
- **Workouts:** aj-standing-barre, aj-floor-barre, aj-all-30-days, action-jacqueline-random-4
- **Exercises:** 31 barre exercises created from this source

### Reddit Recommended Routine (RRR)
- **What:** Bodyweight fitness progression system
- **Import status:** COMPLETE
- **Progressions:** 6 chains (push-up, pull-up, squat, hinge, row, dip) in `progressions/`
- **Exercises tagged:** Multiple exercises have `rrr` tag

### Facebook (various)
- **What:** Miscellaneous kettlebell demos
- **Import status:** COMPLETE
- **Exercises with media:** kettlebell tactical-clean, lateral-lunge, bent-press, front-squat, dead-clean
- **Workouts:** kb-flow-dead-clean-press

### @whoisthismommy (X/Twitter)
- **URL:** https://x.com/whoisthismommy/status/2024684639382855931
- **What:** Compound glute workout — 5 big lifts + cable/machine accessories
- **Import status:** COMPLETE
- **Exercises created:** sumo-squat, cable-glute-kickback, hip-abduction-machine
- **Exercises existing:** bulgarian-split-squat, romanian-deadlift, hip-thrust, back-extension, hip-adductor-machine
- **Workouts:** glute-compound-shred
- **Notes:** Heavy glute-focused session. 5 compounds (BSS, RDL, hip thrust, back extension glute bias, sumo squat) + 3 accessories (cable kickback, abduction, adduction). Can sub for PPL legs day in Functional Bulk.

### Custom Programs
- **Functional Bulk (6x/Week Hybrid)** — custom program combining PPL gym days, KB conditioning, and Zone 2 cardio
- **Program file:** `programs/functional-bulk-6x.json`
- **New workouts created:** `kb-conditioning-blast` (KB complex circuit), `assault-treadmill-intervals` (sprint intervals)
- **New exercises created:** `kettlebell-romanian-deadlift`, `kettlebell-overhead-extension-to-halo`, `lunge`, `incline-bench-dumbbell-row`
- **References existing:** `ppl-push`, `ppl-pull`, `ppl-legs` (KarlApexFit), `kb-full-body-shred`

### General/Uncredited
- **What:** Standard gym, calisthenics, yoga, stretch, rehab exercises
- **Import status:** COMPLETE (base library)
- **Count:** ~416 exercises from general fitness knowledge
- **Includes:** Standard compound lifts, isolation exercises, bodyweight fundamentals, yoga poses, mobility drills

---

## Muscle Group Coverage

Our `muscles` field uses a flat array (no primary/secondary distinction). Available values from `docs/EXTRACT_SCHEMA.md`:

| Region | Muscles | Exercise Count |
|--------|---------|---------------|
| Core | core, abs, obliques, transverse-abdominis, lower-back | 302, 51, 43, 7, 12 |
| Upper Body | shoulders, chest, back, lats, upper-back, rear-delts, traps, serratus | 203, 78, 93, 32, 21, 8, 6, 7 |
| Arms | biceps, triceps, forearms, grip, wrists | 73, 94, 13, 15, 5 |
| Lower Body | glutes, quads, hamstrings, calves, hip-flexors, hips, adductors | 139, 96, 102, 40, 84, 34, 19 |

**Note:** We do NOT have primary vs secondary muscle distinction - just a flat `muscles` array. The KarlApexFit source organizes exercises by *primary* muscle group which could be useful for future categorization work.

---

## Import Checklist

When adding a new source:

1. Extract content using skills (`wod-xai-extract`, `wod-video-extract`) or manually
2. Save raw extraction to `workouts/extracted/` if it's a collection
3. Check which exercises already exist (search by name in `exercises/`)
4. Create missing exercises following schema in `docs/EXTRACT_SCHEMA.md`
5. Add `media` array to exercises if source has video demos
6. Create workout files if source includes programming (sets/reps/rounds)
7. Update this file with the new source entry
