# Update shared WOD's training data

Run on the Mac from the smolbox repository. Keep shared Builder/terminal editing
idle during the update. Source: regular local WOD, including uncommitted data.
Destination: its independently running shared Spark box.

```sh
cd /Users/janzheng/Desktop/Projects/__active/_projects/smolbox
node wod-data-sync.mjs preview
node wod-data-sync.mjs apply '/absolute/plan/path/printed/above.json'
```

Preview reports missing files, updates, retained shared changes and conflicts.
Apply rechecks the plan, backs up replacements outside the served workspace,
copies selected data and rebuilds shared catalogues. Refresh the browser after.
Changed files or a moved box require a fresh preview.

The profile includes exercises, workouts, saved workouts, programs and logs,
progressions, routines, plans, snippets, `docs/notes`, `NOTES.md`, workout media
and existing static note pages. See `roots` in `wod-data-sync.mjs` for the exact
list; new data locations must be added deliberately. Application code, accounts,
`.env`, conversations and Git history are not copied.

Nothing runs automatically. Local changes can update an unchanged shared file.
Shared-only changes remain intact. If both copies changed, apply stops: compare
and merge deliberately. After review, choose an individual source version with
`--source-wins=workouts/path/to/file.json` on the apply command; the previous
destination version is backed up first. No blanket override. Source deletions
never delete shared data.

If copying succeeds but building fails, data/backups remain; the baseline does
not advance. Inspect and create a new preview instead of blindly replaying a
partial run. This manual prototype is not an atomic filesystem transaction;
finish agent edits before syncing.

This does not deploy regular WOD to Deno, import shared changes into the Mac,
or refresh read-only Ask's separate snapshot. Those are separate actions.

Plans/baseline: Mac `~/Library/Application Support/smolbox/data-sync/wod-training`.
Backups/receipts: active Spark import root's `data-sync/wod-training/<plan-id>`.
Keep the baseline; review old backups after the next successful sync. Exact
run paths and retention live in smolbox's LAB.md.
