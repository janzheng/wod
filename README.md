# Workout of the Day (WOD)

This is a fitness exercise library and workout generator.

## Current Status

- The workout for Week 27 Pull (`/workspace/workouts/functional-bulk/fb-w27-pull.json`) has been reviewed.
- The session log for Week 27 Pull (`/workspace/programs/logs/functional-bulk-dynamic-w27.json`) has been reviewed.
- Static files have been rebuilt: `deno task `build:workouts` and `build:exercises` both succeeded.

## Files Inspected

1. `/workspace/workouts/functional-bulk/fb-w27-pull.json` - the workout prescription.
2. `/workspace/programs/logs/functional-bulk-dynamic-w27.json` - the session log for the week.

## Actions Taken

- Ran `deno task build:workouts` → built 332 workouts → static/workouts.json
- Ran `deno task build:exercises` → built 632 exercises → static/exercises.json

No modifications were made to source files; the static catalogues were regenerated from the existing source.

If you intended a different action (e.g., updating the workout based on the log, creating a new week, or deploying), please clarify.