# Randomization Integration Plan

## Current System (CLI)

The CLI already has a sophisticated randomization system:

```
exercises/ (310+ JSON files)
    → catalogued by type, muscles, equipment, tags, challenge

workouts/*.json (workout templates)
    → sets with criteria-based exercise selection
    → set.randomize = true → shuffle exercise order
    → set.poolSize → limit candidate pool

src/cli/generator.ts
    → matchesCriteria() - matches exercises to criteria
    → selectExercise() - picks random from matching pool
    → generateWorkout() - resolves criteria → actual exercises

CLI commands:
    deno task wod:gen --workout=random-4-barre
    deno task wod:random --routine=barre --freeze --save=my-barre
```

## The Gap

The web UI currently:
1. Loads pre-generated static JSON (frozen workouts)
2. No way to re-randomize in the browser
3. Doesn't use the criteria-based template system

## Solution: Port Generator to Browser

Since `generator.ts` has no Deno-specific APIs, we can port it to run in the browser.

### Architecture

```
Static Files (served by Deno):
├── /exercises/index.json     ← NEW: All exercises in one file
├── /workouts/**/*.json       ← Existing templates with criteria
├── /progressions/*.json      ← Optional: progression chains

Browser (Alpine.js):
├── loadExercisesCatalogue()  ← Fetch exercises index
├── generateWorkout()         ← Ported from generator.ts
├── shuffleSet(setId)         ← Re-run generator for specific set
└── shuffleWorkout()          ← Re-run entire workout
```

---

## Implementation Steps

### Phase 1: Create Static Exercises Index

Create a single JSON file with all exercises for browser loading.

**New file: `/static/exercises.json`**

```bash
# Build script to concatenate all exercises into one file
deno task build:exercises
```

```typescript
// scripts/build-exercises.ts
import { walk } from "@std/fs";
import { exerciseSchema } from "../src/schemas.ts";

const exercises = [];
for await (const entry of walk("./exercises", { exts: [".json"] })) {
  const data = JSON.parse(await Deno.readTextFile(entry.path));
  exercises.push(exerciseSchema.parse(data));
}
await Deno.writeTextFile("./static/exercises.json", JSON.stringify(exercises));
```

### Phase 2: Port Generator to Browser

Create a browser-compatible version of the generator.

**New file: `/static/generator.js`**

```javascript
// Ported from src/cli/generator.ts - no Deno APIs

function matchesCriteria(exercise, criteria) {
  if (criteria.exerciseId) {
    return exercise.id === criteria.exerciseId;
  }
  if (criteria.types?.length > 0) {
    if (!criteria.types.includes(exercise.type)) return false;
  }
  if (criteria.muscles?.length > 0) {
    if (!criteria.muscles.some(m => exercise.muscles.includes(m))) return false;
  }
  if (criteria.tags?.length > 0) {
    if (!criteria.tags.some(t => exercise.tags.includes(t))) return false;
  }
  if (criteria.equipment?.length > 0) {
    if (!criteria.equipment.some(e => exercise.equipment.includes(e))) return false;
  }
  if (criteria.excludeTags?.length > 0) {
    if (criteria.excludeTags.some(t => exercise.tags.includes(t))) return false;
  }
  if (criteria.challengeId) {
    if (!exercise.challenge || exercise.challenge.id !== criteria.challengeId) return false;
  }
  return true;
}

function selectExercise(exercises, criteria, used, poolSize) {
  let candidates = exercises.filter(e => matchesCriteria(e, criteria));

  if (poolSize && candidates.length > poolSize) {
    candidates = shuffle(candidates).slice(0, poolSize);
  }

  const unused = candidates.filter(e => !used.has(e.id));
  if (unused.length > 0) {
    const selected = unused[Math.floor(Math.random() * unused.length)];
    used.add(selected.id);
    return selected;
  }

  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return null;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function generateWorkout(workout, exercises) {
  const sets = workout.sets.map(set => {
    if (set.type !== 'exercises' || !set.exercises) {
      return set;
    }

    const used = new Set();
    const generatedExercises = (set.randomize ? shuffle(set.exercises) : set.exercises)
      .map(se => {
        const exercise = selectExercise(exercises, se.criteria, used, set.poolSize);
        if (exercise) {
          return {
            id: exercise.id,
            name: exercise.name,
            reps: se.reps,
            duration: se.duration,
            notes: se.notes,
            description: exercise.description,
            challengeDay: exercise.challenge?.day,
          };
        }
        return { id: 'unknown', name: `[No match]`, ...se };
      });

    return { ...set, generatedExercises };
  });

  return { ...workout, sets };
}

export { generateWorkout, matchesCriteria, selectExercise };
```

### Phase 3: Update Alpine.js App

Add the generator and shuffle functionality.

**Updates to `index.html`:**

```javascript
function routineStackApp() {
  return {
    // ... existing state ...
    exercisesCatalogue: [],  // NEW: loaded exercises

    async init() {
      // ... existing init ...

      // Load exercises catalogue for randomization
      await this.loadExercisesCatalogue();
    },

    async loadExercisesCatalogue() {
      try {
        const res = await fetch('./static/exercises.json');
        if (res.ok) {
          this.exercisesCatalogue = await res.json();
        }
      } catch (e) {
        console.warn('Could not load exercises catalogue:', e);
      }
    },

    // Check if a set can be randomized
    isRandomizable(set) {
      return set.type === 'exercises' &&
             set.exercises?.some(e => !e.criteria?.exerciseId);
    },

    // Shuffle a specific set
    shuffleSet(setId) {
      if (!this.selectedWorkout || !this.exercisesCatalogue.length) return;

      const setIndex = this.selectedWorkout.sets.findIndex(s => s.id === setId);
      if (setIndex === -1) return;

      const set = this.selectedWorkout.sets[setIndex];
      const generated = generateSetExercises(
        set.exercises,
        this.exercisesCatalogue,
        true,  // randomize
        set.poolSize
      );

      // Update the set with new exercises
      this.selectedWorkout.sets[setIndex] = {
        ...set,
        generatedExercises: generated,
      };
    },

    // Shuffle entire workout
    shuffleWorkout() {
      if (!this.selectedWorkout || !this.exercisesCatalogue.length) return;

      this.selectedWorkout = generateWorkout(
        this.selectedWorkout,
        this.exercisesCatalogue
      );
    },
  };
}
```

### Phase 4: Update UI with Shuffle Buttons

Add shuffle buttons to randomizable sets and workouts.

```html
<!-- Workout header with shuffle button -->
<div class="workout-header">
  <h2 x-text="selectedWorkout.name"></h2>
  <template x-if="hasRandomizableSets()">
    <button class="shuffle-btn" @click="shuffleWorkout()">
      <span class="iconify" data-icon="lucide:shuffle"></span>
      <span>Shuffle All</span>
    </button>
  </template>
</div>

<!-- Set header with shuffle button -->
<template x-for="set in selectedWorkout.sets">
  <div class="workout-set">
    <div class="set-header">
      <h3 x-text="set.name || 'Exercises'"></h3>
      <template x-if="isRandomizable(set)">
        <button class="shuffle-btn-sm" @click="shuffleSet(set.id)">
          <span class="iconify" data-icon="lucide:refresh-cw"></span>
        </button>
      </template>
    </div>
    <!-- Exercise list -->
    <template x-for="ex in (set.generatedExercises || set.exercises)">
      <div class="exercise-item">
        <span x-text="ex.name"></span>
        <template x-if="ex.challengeDay">
          <span class="badge" x-text="'Day ' + ex.challengeDay"></span>
        </template>
      </div>
    </template>
  </div>
</template>
```

---

## Workout Template Example

Update existing workout to use criteria-based selection:

```json
{
  "id": "random-4-barre",
  "name": "Random 4 Barre",
  "description": "4 random exercises from the 100-Reps Challenge",
  "sets": [
    {
      "id": "random-selection",
      "name": "Today's Selection",
      "type": "exercises",
      "randomize": true,
      "poolSize": 30,
      "exercises": [
        { "criteria": { "challengeId": "100-reps-barre-leg-challenge" }, "reps": 100 },
        { "criteria": { "challengeId": "100-reps-barre-leg-challenge" }, "reps": 100 },
        { "criteria": { "challengeId": "100-reps-barre-leg-challenge" }, "reps": 100 },
        { "criteria": { "challengeId": "100-reps-barre-leg-challenge" }, "reps": 100 }
      ]
    }
  ]
}
```

When generated, this becomes:
```json
{
  "generatedExercises": [
    { "id": "barre-squat-jump", "name": "Squat Jump", "reps": 100, "challengeDay": 26 },
    { "id": "barre-donkey-kick", "name": "Donkey Kick", "reps": 100, "challengeDay": 17 },
    { "id": "barre-bridge-single-leg", "name": "Single Leg Bridge", "reps": 100, "challengeDay": 14 },
    { "id": "barre-fire-hydrant", "name": "Fire Hydrant", "reps": 100, "challengeDay": 12 }
  ]
}
```

---

## Files to Create/Modify

### New Files:
1. `static/exercises.json` - Concatenated exercises catalogue
2. `static/generator.js` - Browser-compatible generator
3. `scripts/build-exercises.ts` - Build script for exercises index

### Modified Files:
1. `deno.json` - Add `build:exercises` task
2. `index.html` - Add generator, shuffle logic, shuffle buttons
3. `styles/app.scss` - Add shuffle button styles

### Optional Updates:
1. `workouts/barre/random-4-barre.json` - Convert to criteria-based template
2. Add more randomizable workout templates

---

## Benefits

1. **Uses existing system** - No new schema, just ports CLI to browser
2. **Progressive enhancement** - Static workouts still work, randomization is optional
3. **Consistent** - Same logic CLI and browser
4. **Extensible** - Easy to add more criteria filters
