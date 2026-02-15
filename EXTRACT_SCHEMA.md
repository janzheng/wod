# Exercise & Routine Extraction Schema

Analyze this fitness/exercise video or post and extract the information into the JSON schema below.

---

## Content Type

Determine the content type:
- **exercise** = Single exercise with optional variations
- **circuit** = Mini-workout with multiple exercises, rounds, and rest (most social media workouts)
- **sequence** = Short routine/flow (yoga, mobility) where exercises flow together
- **demo** = Equipment tutorial or technique breakdown
- **variations** = Multiple variations of one movement pattern

---

## What to Extract

- Exercise names (use common fitness terminology)
- Duration or rep counts if mentioned/shown
- Form cues and coaching points
- Equipment needed
- Muscle groups targeted
- Difficulty level
- Rounds, sets, and rest periods
- Any progressions or regressions shown

---

## JSON Schema

```json
{
  "id": "unique-slug-based-on-content",
  "name": "Descriptive name for this content",
  "type": "calisthenics | weights | barre | yoga | stretch | plyo | rehab | cardio",
  "source": {
    "platform": "instagram | tiktok | youtube | twitter",
    "url": "original video URL",
    "creator": "@handle or channel name",
    "capturedAt": "ISO date when saved"
  },
  "tags": ["see tag list below"],
  "equipment": ["see equipment list below"],
  "muscles": ["see muscles list below"],
  "difficulty": "beginner | intermediate | advanced",
  "estimatedDuration": 15,
  "description": "Brief description of the workout and its focus",

  "exercises": [
    {
      "name": "Exercise Name",
      "reps": 20,
      "duration": null,
      "notes": "Form cues, tempo, breathing",
      "description": "Detailed description of the movement"
    }
  ],

  "circuit": {
    "rounds": 4,
    "repsPerExercise": 20,
    "restBetweenExercises": 0,
    "restBetweenRounds": 60,
    "notes": "Overall circuit notes"
  },

  "sequence": {
    "rounds": 1,
    "restBetween": 0,
    "flow": "Whether exercises flow together or have distinct breaks",
    "notes": "Overall sequence notes"
  },

  "raw": {
    "transcript": "Full spoken audio/narration from video",
    "caption": "Original post text/caption from social media",
    "textOverlays": ["Text shown on screen in the video"],
    "visualSummary": "Brief description of what's happening visually"
  },

  "confidence": {
    "overall": "high | medium | low",
    "uncertainties": ["List anything unclear or guessed"]
  }
}
```

---

## Available Values

### Types
- `calisthenics` - Bodyweight strength exercises
- `weights` - Dumbbell, barbell, kettlebell, plate exercises
- `barre` - Ballet-inspired toning movements
- `yoga` - Yoga poses and flows
- `stretch` - Static stretching
- `plyo` - Plyometric/jumping exercises
- `rehab` - Rehabilitation and corrective exercises
- `cardio` - Cardiovascular exercises

### Tags
| Category | Tags |
|----------|------|
| Position | `floor`, `on-back`, `on-hands`, `standing` |
| Body Region | `core`, `abs`, `upper-body`, `lower-body`, `full-body`, `legs`, `shoulders`, `back`, `obliques`, `glutes` |
| Movement Type | `compound`, `isolation`, `push`, `pull`, `squat`, `hinge`, `isometric`, `hold`, `unilateral`, `dynamic`, `twist` |
| Style | `circuit`, `rrr`, `calisthenics`, `gym`, `skill-work`, `gymnastics`, `warmup`, `cardio`, `hiit`, `dance`, `yoga`, `stretch`, `mobility`, `active-stretch`, `gentle`, `finisher` |
| Equipment Context | `machine`, `jump-rope`, `weighted` |
| Skill Level | `advanced`, `beginner` |
| Variations | `push-up-variation`, `plank-variation`, `inversion` |
| Special | `balance`, `hip-opener`, `posterior-chain`, `maternity`, `snippet` |

### Equipment
- `bodyweight` - No equipment needed
- `mat` - Exercise/yoga mat
- `weight-plate` - Weight plate
- `dumbbell` - Dumbbells
- `pull-up-bar` - Pull-up bar
- `rings` - Gymnastic rings
- `parallettes` - Parallettes
- `resistance-band` - Resistance bands
- `barbell` - Barbell
- `kettlebell` - Kettlebell
- `bench` - Weight bench
- `cable` - Cable machine
- `machine` - Gym machines
- `smith-machine` - Smith machine
- `box` - Plyo box
- `jump-rope` - Jump rope
- `wall` - Wall for support
- `stability-ball` - Stability/exercise ball
- `yoga-block` - Yoga block

### Muscles
| Region | Muscles |
|--------|---------|
| Core | `core`, `abs`, `obliques`, `transverse-abdominis`, `lower-back` |
| Upper Body | `shoulders`, `chest`, `back`, `lats`, `upper-back`, `rear-delts`, `traps`, `serratus` |
| Arms | `biceps`, `triceps`, `forearms`, `grip`, `wrists` |
| Lower Body | `glutes`, `quads`, `hamstrings`, `calves`, `hip-flexors`, `hips`, `adductors` |
| Other | `full-body`, `pelvic-floor`, `neck`, `spine` |

### Difficulty
- `beginner` - New to exercise or learning fundamentals
- `intermediate` - Solid foundation, building strength
- `advanced` - High skill or strength requirements

---

## Content Type Examples

### Circuit (Mini-Workout)
Small workout with rounds, reps, and rest periods. Most social media workouts are this type.

```json
{
  "id": "plate-abs-workout",
  "name": "Plate Abs Workout",
  "type": "weights",
  "source": {
    "platform": "twitter",
    "url": "https://twitter.com/...",
    "creator": "@fitnesscoach",
    "capturedAt": "2025-02-05"
  },
  "tags": ["core", "abs", "circuit", "weighted", "floor", "on-back", "finisher"],
  "equipment": ["weight-plate", "mat"],
  "muscles": ["abs", "core", "obliques", "hip-flexors"],
  "difficulty": "intermediate",
  "estimatedDuration": 15,
  "description": "Intense ab circuit using a weight plate. 4 rounds of 4 exercises, 20 reps each.",
  "exercises": [
    {
      "name": "Sit Up Twist",
      "reps": 20,
      "description": "Lie on your back holding a weight plate overhead. Perform a sit-up while twisting your torso to one side, bringing the plate towards the opposite knee. Alternate sides.",
      "notes": "Keep plate extended, control the descent"
    },
    {
      "name": "Suitcases",
      "reps": 20,
      "description": "Lie on your back holding the plate overhead with straight arms. Simultaneously crunch your upper body and bring your knees towards your chest, folding like a suitcase while keeping the plate extended.",
      "notes": "Keep arms straight, touch knees to elbows"
    },
    {
      "name": "Leg Raises",
      "reps": 20,
      "description": "Lie on your back holding the plate overhead. Lift your straight legs upward towards the ceiling, raising your hips slightly off the ground for emphasis on the lower abs.",
      "notes": "Press lower back into floor, lift hips at top"
    },
    {
      "name": "Toe Touches",
      "reps": 20,
      "description": "Lie on your back with legs extended upward (perpendicular to the floor). Hold the plate and reach upward to touch your toes with the plate, crunching your upper body.",
      "notes": "Keep legs vertical, reach plate to toes"
    }
  ],
  "circuit": {
    "rounds": 4,
    "repsPerExercise": 20,
    "restBetweenExercises": 0,
    "restBetweenRounds": 60,
    "notes": "Perform all four exercises in sequence for one round"
  }
}
```

### Exercise (Single Movement)
Single exercise with form tips or variations.

```json
{
  "id": "cable-face-pull",
  "name": "Cable Face Pull",
  "type": "weights",
  "muscles": ["rear-delts", "upper-back", "shoulders"],
  "equipment": ["cable"],
  "tags": ["pull", "isolation", "gym", "shoulders"],
  "difficulty": "beginner",
  "estimatedDuration": 5,
  "description": "External rotation focused pulling movement. Stand facing cable machine, pull rope to face level with elbows high, squeeze rear delts at the end.",
  "exercises": [
    {
      "name": "Cable Face Pull",
      "description": "External rotation focused pulling movement",
      "notes": "Elbows high, pull to forehead, squeeze rear delts",
      "variations": ["Band face pull", "Single arm face pull"]
    }
  ]
}
```

### Sequence (Short Routine/Flow)
Yoga flows, mobility routines where exercises flow together without distinct breaks.

```json
{
  "id": "hip-mobility-5-min",
  "name": "5-Minute Hip Opener Flow",
  "type": "stretch",
  "muscles": ["hips", "hip-flexors", "glutes", "adductors"],
  "equipment": ["mat"],
  "tags": ["floor", "hip-opener", "mobility", "gentle"],
  "difficulty": "beginner",
  "estimatedDuration": 5,
  "description": "Quick hip mobility routine targeting all angles of hip movement",
  "exercises": [
    { "name": "90/90 Stretch", "duration": 60 },
    { "name": "Pigeon Pose", "duration": 60 },
    { "name": "Frog Stretch", "duration": 60 },
    { "name": "Deep Squat Hold", "duration": 60 },
    { "name": "Couch Stretch", "duration": 60 }
  ],
  "sequence": {
    "rounds": 1,
    "flow": "Hold each position, transition smoothly"
  }
}
```

### Demo (Equipment/Technique Tutorial)
Equipment explanations or detailed technique breakdowns.

```json
{
  "id": "cable-back-setup",
  "name": "Cable Machine Setup for Back Exercises",
  "type": "weights",
  "muscles": ["back", "lats"],
  "equipment": ["cable"],
  "tags": ["gym", "machine", "pull"],
  "difficulty": "beginner",
  "description": "How to set up and use cables for various back movements",
  "exercises": [
    { "name": "Lat Pulldown", "notes": "Attachment: wide bar, Position: seated" },
    { "name": "Seated Row", "notes": "Attachment: V-bar, Position: seated" },
    { "name": "Straight Arm Pulldown", "notes": "Attachment: rope, Position: standing" }
  ]
}
```

### Variations (Movement Pattern Variations)
Multiple ways to perform the same movement pattern.

```json
{
  "id": "push-up-variations",
  "name": "Push-Up Variations for All Levels",
  "type": "calisthenics",
  "muscles": ["chest", "triceps", "shoulders", "core"],
  "equipment": ["bodyweight"],
  "tags": ["push", "push-up-variation", "compound", "upper-body"],
  "difficulty": "beginner",
  "description": "Progressive push-up variations from easiest to hardest",
  "exercises": [
    { "name": "Wall Push-Up", "notes": "Beginner" },
    { "name": "Incline Push-Up", "notes": "Beginner" },
    { "name": "Standard Push-Up", "notes": "Intermediate" },
    { "name": "Diamond Push-Up", "notes": "Intermediate" },
    { "name": "Archer Push-Up", "notes": "Advanced" },
    { "name": "One-Arm Push-Up", "notes": "Advanced" }
  ]
}
```

---

## Full Extraction Example

**Input**: X post showing "PLATE ABS WORKOUT" - 4 rounds, 20 reps each exercise, 60 seconds rest

**Output**:
```json
{
  "id": "plate-abs-workout",
  "name": "Plate Abs Workout",
  "type": "weights",
  "source": {
    "platform": "twitter",
    "url": "https://twitter.com/...",
    "creator": "@fitnesscoach",
    "capturedAt": "2025-02-05"
  },
  "tags": ["core", "abs", "circuit", "weighted", "floor", "on-back", "finisher", "snippet"],
  "equipment": ["weight-plate", "mat"],
  "muscles": ["abs", "core", "obliques", "hip-flexors"],
  "difficulty": "intermediate",
  "estimatedDuration": 15,
  "description": "Intense ab circuit using a weight plate. 4 rounds of 4 exercises, 20 reps each with 60 seconds rest between rounds.",
  "exercises": [
    {
      "name": "Sit Up Twist",
      "reps": 20,
      "description": "Lie on your back holding a weight plate overhead. Perform a sit-up while twisting your torso to one side, bringing the plate towards the opposite knee. Alternate sides.",
      "notes": "Keep plate extended, control the descent"
    },
    {
      "name": "Suitcases",
      "reps": 20,
      "description": "Lie on your back holding the plate overhead with straight arms. Simultaneously crunch your upper body and bring your knees towards your chest, folding like a suitcase while keeping the plate extended.",
      "notes": "Keep arms straight, touch knees to elbows"
    },
    {
      "name": "Leg Raises",
      "reps": 20,
      "description": "Lie on your back holding the plate overhead. Lift your straight legs upward towards the ceiling, raising your hips slightly off the ground for emphasis on the lower abs.",
      "notes": "Press lower back into floor, lift hips at top"
    },
    {
      "name": "Toe Touches",
      "reps": 20,
      "description": "Lie on your back with legs extended upward (perpendicular to the floor). Hold the plate and reach upward to touch your toes with the plate, crunching your upper body.",
      "notes": "Keep legs vertical, reach plate to toes"
    }
  ],
  "circuit": {
    "rounds": 4,
    "repsPerExercise": 20,
    "restBetweenExercises": 0,
    "restBetweenRounds": 60,
    "notes": "Perform all four exercises in sequence for one round"
  },
  "raw": {
    "transcript": "",
    "caption": "PLATE ABS WORKOUT 🔥 4 rounds | 20 reps each | 60 sec rest. Try this core burner!",
    "textOverlays": ["PLATE ABS WORKOUT", "4 ROUNDS", "20 REPS", "60 SEC REST", "SIT UP TWIST", "SUITCASES", "LEG RAISES", "TOE TOUCHES"],
    "visualSummary": "Man on gym floor mat performing 4 different ab exercises holding a weight plate. Each exercise shown with text overlay naming the movement."
  },
  "confidence": {
    "overall": "high",
    "uncertainties": ["Rest period may be between rounds or between exercises - assumed between rounds based on typical circuit format"]
  }
}
```

---

## Storage Categories

Organize extracted content by purpose:

| Category | Description | Examples |
|----------|-------------|----------|
| `barre` | Ballet-inspired toning | Plie pulses, leg lifts, arabesque |
| `calisthenics` | Bodyweight strength | Push-ups, pull-ups, dips, levers |
| `gym` | Weight training | Machine exercises, dumbbell work |
| `yoga` | Yoga poses and flows | Sun salutation, hip-focused flows |
| `cardio` | Cardiovascular work | Jump rope, HIIT, running |
| `morning` | Wake-up routines | Gentle stretches, light movement |
| `challenges` | Fitness challenges | 100-rep challenges, progressions |
| `maternity` | Prenatal/postnatal | Safe pregnancy exercises |
| `jump-rope` | Jump rope workouts | Skills, circuits, combos |
| `snippets` | Social media finds | Mini-circuits, random workouts to try |

---

## Quick Extraction Template

For fast captures:

```json
{
  "id": "",
  "name": "",
  "type": "calisthenics | weights | barre | yoga | stretch | plyo | rehab | cardio",
  "source": { "platform": "", "url": "", "creator": "" },
  "muscles": [],
  "equipment": [],
  "tags": ["snippet"],
  "difficulty": "beginner | intermediate | advanced",
  "estimatedDuration": null,
  "description": "",
  "exercises": [
    { "name": "", "reps": null, "duration": null, "description": "", "notes": "" }
  ],
  "circuit": {
    "rounds": 1,
    "repsPerExercise": null,
    "restBetweenRounds": 60
  },
  "raw": {
    "transcript": "",
    "caption": "",
    "textOverlays": [],
    "visualSummary": ""
  },
  "confidence": {
    "overall": "high | medium | low",
    "uncertainties": []
  }
}
```

---

## Converting to WOD Workout Format

To add an extracted circuit to the WOD app, convert it to this format:

```json
{
  "id": "plate-abs-workout",
  "name": "Plate Abs Workout",
  "description": "Intense ab circuit using a weight plate",
  "routineId": "snippets",
  "tags": ["core", "abs", "circuit", "weighted", "snippet"],
  "estimatedDuration": 15,
  "equipment": ["weight-plate", "mat"],
  "source": "@fitnesscoach",
  "sourceUrl": "https://twitter.com/...",
  "sets": [
    {
      "id": "main-circuit",
      "name": "Plate Ab Circuit",
      "type": "exercises",
      "rounds": 4,
      "exercises": [
        { "id": "sit-up-twist", "name": "Sit Up Twist", "reps": 20 },
        { "id": "suitcases", "name": "Suitcases", "reps": 20 },
        { "id": "leg-raises", "name": "Leg Raises", "reps": 20 },
        { "id": "toe-touches", "name": "Toe Touches", "reps": 20 }
      ],
      "restBetween": 0,
      "restAfter": 60
    }
  ]
}
```
