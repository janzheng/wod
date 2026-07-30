# Load-Descriptor Drift Report (W23 audit)

**Date:** 2026-07-29 · **Trigger:** user, W23D3 — "week 15 is right and then it gradually got drifted into fuckery."

**Why this exists:** weekly workout files were built by copying the previous week, so wrong station labels and invented numbers compounded silently. This report marks, per cable lift, **which historical datapoints are real and which are poisoned**, so old files can't re-contaminate new weeks.

**The read-path rule (the actual fix):** new weeks pull loads from the **Equipment Calibration Table (NOTES.md)** + **`deno task audit <lift>`** (log history). **Old workout files are NEVER a load reference** — they are the drift vector this report documents. If a station listed anywhere has no log datapoint, treat it as fabricated until the user confirms it.

A lift appearing on multiple stations is **expected** (availability — people camp on stations). Drift = a wrong *number*, a fabricated *station*, or a number labeled with the wrong station. Multi-station itself is fine.

---

## cable-crunch — POISONED W16–W23, now corrected

It is a **cable pulley (rope)** lift. Cable-column equivalent ≈ **270** (confirmed W23D3 — huge pulley mechanical advantage).

| Weeks | What happened | Verdict |
|---|---|---|
| W7–W12 | 110–130 era, station labels loose ("cable column 130" W13 prescription never validated) | ❌ don't quote any of it |
| W13–W15 | pulley: 62.5 → 72.5 → **77.5 (W15 — the trusted reference)** | ✅ real |
| W16–W20 | number sagged to 62.5–67.5 range; station still rope pulley | ⚠️ numbers real but the sag itself was drift-driven (regenerated low instead of holding 77.5) |
| W21 | logged "67.5 **cable column**" — label copied from drifted prescription; rawInput named no station | ❌ label was wrong → **log corrected 2026-07-29** (now rope pulley, with correction note) |
| W23 | prescription said "cable column 67.5" — wrong station AND meaningless number on that scale | ❌ → prescription fixed (rope 67.5–77.5 / column 270) |

**Current truth:** rope pulley **67.5–77.5** (77.5 = strong reference) OR cable column **270**. Log which.

## high-cable-bicep-curl — FABRICATED STATION, now corrected

| Datapoint | Verdict |
|---|---|
| Cable column ~170–180 (W12–W18, used again W23D3) | ✅ real |
| Single pulley 62.5 "brutal" (W19D3) | ✅ real |
| Weight-stack "~120" (W8/W10) | ⚠️ rough era-estimate, station never pinned — don't quote |
| **"Dual pulley ~60"** (W23 prescription) | ❌ **fabricated — no log datapoint ever.** Removed. |
| W16 log "170 column / ~120 pulley (established; not separately cited)" | ⚠️ boilerplate posing as a datapoint — not a measurement |

**Current truth:** cable column **170–180** OR single pulley **62.5**. Log which.

## incline-cable-overhead-tricep-extension — legit multi-station, no poison

Column **70** (W12) · rope pulley floor/kneeling **35 (W17) → 42.5 (W23D1, "go up slightly")** · Kinesis **5** fallback. All datapoints real; the ⚠️ station-drift flag is availability variance, not error.

## cable-lateral-raise — legit multi-station, no poison

Kinesis **5–6** (default since W9) · column **~30** · pulley D-handle **10 (W17) / 9 (W23D1)**. All real.

## Clean (no station drift flagged)

lat-pulldown (70/side dual pulley settled) · face-pull (adjustable pulley + rope 50; W23D3 tried "a different stack" at 52.5 — pin the stack name next session) · seated-cable-row · cable-tricep-pushdown · kinesis-cable-fly · straight-arm-pulldown (column 120 / rope pulley 62.5 kneeling, both real).

---

**Log corrections made under the flagged-error exception:** W21D3 cable-crunch station label (column → rope pulley). rawInput fields are never touched.
