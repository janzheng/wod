# WOD audit fixes

Canonical WOD-owned fix record for the 2026-08-29 cross-project audit. The
complete evidence remains in
[`smolbox/TASKS-AUDIT.md`](../../_projects/smolbox/TASKS-AUDIT.md).

## P1

- [x] **A091** Public Pi execution has four global turn slots, a ten-minute
  deadline, request cancellation, and TERM→KILL child shutdown.

## P2

- [x] **A092** Persistent Pi browser sessions have a 256-session admission cap
  and explicit DELETE-backed clear; no automatic deletion was added.
- [x] **A093** The public endpoint enforces a 32 KiB streamed body limit and a
  16 KiB UTF-8 prompt limit before spawning Pi.
- [x] **A094** Page-aware exercise/workout context points to the canonical
  `exercises/` and `workouts/` source directories.
- [x] **A095** User/error turns persist consistently; canceled/stale replies are
  ignored; clear aborts the turn and removes its Pi session.
- [x] **A096** Service-worker v6 uses network-first HTML navigation while
  retaining a refreshed cached offline fallback.

## Verification

- Host and `smolbox-wod`: `deno task ai:test:all` passed 58/58.
- Focused lint passed.
- Route smoke proved 413 handling, DELETE CORS, and service-worker v6.
- The existing app-wide `deno check main.ts` still reports nine unrelated,
  pre-existing errors; this audit did not broaden into those product changes.

