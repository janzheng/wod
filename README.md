# Workout of the Day

Exercise library, saved workouts, programs and training notes. Agent rules:
[AGENTS.md](AGENTS.md). Box operations and file exchange:
[WOD smolbox workflow](docs/guides/smolbox-workflow.md).

## Update shared WOD with this checkout's training data

Run on the Mac, not inside the VM. Finish shared agent edits first:

```sh
cd /Users/janzheng/Desktop/Projects/__active/_projects/smolbox
node wod-data-sync.mjs preview
node wod-data-sync.mjs apply '/absolute/plan/path/printed/above.json'
```

This sends the declared training data (including notes/logs/media) from this
regular WOD checkout to the independent Spark shared box and rebuilds it.
It backs up replacements, preserves shared-only changes, and flags conflicts.
No automatic deletion, reverse sync, account/code copying, Deno deployment or
Ask snapshot refresh. The personal Mac VM is a third checkout, not this target.

Full scope, conflict handling and recovery:
[sync workflow](docs/guides/smolbox-workflow.md#update-the-separate-shared-spark-box).
Inside the shared shell, `docs wod-data-sync` shows the full manual.
