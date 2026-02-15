# Workout Stack Tasks

## Current Sprint (Complete)
- [x] Design simplified schema (Routine → Workout → Set)
- [x] Implement schemas-v2.ts
- [x] Create example workouts (8 files: gym, barre, cardio)
- [x] Create routine definitions (5 routines)
- [x] Build CLI with generate/list/load commands
- [x] Add deno tasks for testing (22 tasks)
- [x] Implement save/load system with references
- [x] Integrate progressions (6 RRR progressions)
- [x] Validate and tag all 311 exercises

## Progressions (Done)

**6 Reddit RRR Progressions:**
| Progression | Levels (easy → hard) |
|-------------|----------------------|
| push-up | wall → incline → knee → push-up → diamond |
| pull-up | scapular-pull → arch-hang → negative → assisted → pull-up |
| squat | assisted → bodyweight → split → bulgarian → pistol |
| hinge | romanian-deadlift → single-leg-deadlift → banded-nordic → nordic-curl |
| row | incline → horizontal → wide |
| dip | support-hold → negative → assisted → dip |

**MVP (done):**
- [x] Progression files exist in `progressions/`
- [x] Add `progression` as criteria option in generator
- [x] Random exercise selection from progression chain
- [x] Example workout: `rrr-progressions` (`deno task wod:gym:rrr`)

**Usage in workouts:**
```json
{
  "exercises": [
    { "criteria": { "progression": "push-up-progression" }, "reps": "5-8" },
    { "criteria": { "progression": "row-progression" }, "reps": "5-8" }
  ]
}
```

## [[future]] User Progression Tracking
- Add `saved/profile.json` for user's current levels:
  ```json
  {
    "progressions": {
      "push-up-progression": 3,  // currently at push-up (index 3)
      "pull-up-progression": 2   // currently at negative-pull-up
    }
  }
  ```
- Generator picks user's current level instead of random
- Commands to manage:
  - `deno task wod:progress` - Show current levels
  - `deno task wod:progress push-up-progression 3` - Set level
  - `deno task wod:progress --up push-up-progression` - Level up
- Auto-suggest level-up after X successful sessions

## [[future]] Web UI
- Update main.ts to use new workout/routine structure
- Simplify the Discover/Workouts/Exercises tabs
- Add routine-first navigation

## [[future]] Agentic Chatbot
- Natural language workout requests
- "Give me a 15-minute barre focusing on glutes"
- Generate new exercises and save to catalogue
- Personalized workout recommendations

## [[future]] Challenge Circuits
- Migrate 100-workout challenge circuit into new workout/routine system
- Migrate 110-workout challenge circuit into new workout/routine system
- Add CLI support: `deno task wod:challenge:100` and `deno task wod:challenge:110`
- Each challenge as a routine with proper workout definitions

## [[future]] Superset Enhancements
- Full superset/pair/triplet support in CLI output
- Rest timing between superset exercises
- Giant set formatting

## Notes
- exercises/ folder contains 311 properly tagged exercises
- All exercises validated: required fields (tags, muscles, equipment, difficulty)
- RRR progression exercises tagged with `rrr`
- Barre exercises tagged with position tags (floor/standing)
