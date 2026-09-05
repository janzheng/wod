# Swim Coaching Log

Started 2026-09-02. Swimming entered the program during W28 (newborn period) unprompted — the apartment pool is downstairs, which is the whole reason it works right now. He then asked to open it up to the same back-and-forth coaching loop as lifting: *"i've never actually taken swimming classes would be cool to use this opportunity to improve on my swim as well, through this kind of writing feedback / back and forth."*

**Poolside page:** `workouts/swim/swim-technique-rotation.json` → `/swim-technique-rotation` in the app. That's the thing to pull up on a phone at the pool. This file is the coaching context behind it.

---

## The brief

**Technique only. Explicitly not speed.**

> *"i just want better technique in the water lol; i dont care if i'm fast or not i just want good breathing / stroke / swim / leg cadence"*

- **Never frame feedback around pace or time.** No stopwatch, no intervals-for-fitness, no "faster."
- **Volume stays untracked**, same as the KB days and same as `feedback_fuzzy_progression_goal`. The lap count is not the progression and is never owed.
- **Stroke count per length is the one allowed number** — it measures efficiency, not effort, and it goes DOWN as he improves. Ask for it; never ask for a split.
- He has watched enough YouTube to know the concepts. **Don't explain theory at him — give drills.** *"i've seen enough youtube to know what i'm supposed to be doing; nothing is very automatic tho."*

## The swimmer

| | |
|---|---|
| **Pool** | Apartment pool, but a real short-course lap pool with lane lines and dividers (~25m/25yd). His "half-length" meant half-Olympic. No length constraint on technique work. |
| **Stroke** | Freestyle throughout. |
| **Breathing** | Bilateral, alternating sides. Left is comfortable, right is the one he's actively working. Already exhales underwater — **this was never a problem, don't re-coach it.** |
| **"Lap"** | Means **down and back** to him (2 lengths). So 30 laps ≈ 60 lengths ≈ 1500. Volume is much higher than the word "laps" first suggested. |
| **Head** | Working on keeping the chin tucked-ish. Instinct is right; just needs to stay neutral rather than jammed. |
| **Background** | Lifter. Former V5/V6 boulderer. Strong lats, strong shoulders, strong grip. |

**Ramp so far (W28):** Sun 20 laps → Tue 30 → Wed 30 (held at 30 instead of the planned 40 after the soreness conversation — good call, and he made it himself). Soreness during this stretch was the ramp, not the swimming; it settles once volume stops climbing.

## Failure profile

> *"i think i just get tired; legs should be working more than they do; shoulders def tired i think, pretty much all of it"*
> *"i think shoulders give out, or if i swim really lazily it's like phlegm; legs dont ever feel like they're sinking"*

Two distinct limiters depending on effort:

- **Working hard → shoulders give out.**
- **Cruising easy → phlegm/throat, around lap 20 (~1000).**

## Diagnosis (2026-09-02)

**One problem, not four: he's swimming flat — little or no body rotation.**

Tired shoulders + legs that contribute nothing + general early fatigue is the classic flat-swimming signature. Without rotation the arms supply all the propulsion and the kick can't connect to anything, so "kick harder" never fixes the legs.

**The confirming tell: left-side breathing easy, right-side hard.** In freestyle you breathe *by rotating the body*, not by turning the head. A head-turner can crank the neck far enough on the dominant side and get away with it; the weak side exposes the habit. The right-side difficulty is therefore not a right-side problem — it's the rotation problem surfacing.

**Caveat, honestly held:** legs never feel like they're sinking, which is the one flat-swimming symptom he does *not* report. So body position is probably better than the diagnosis alone would predict — possibly he's kicking hard enough to hold the legs up, which would itself explain fatigue. Rotation is still the read, but hold it loosely and re-check once he's drilled it.

**His lifting is a liability here.** Strong lats let a swimmer muscle through bad position instead of fixing it — the stronger the puller, the longer they can paper over it. Expect him to want to work the pull. Resist. **Do not add pull/catch cues until rotation is automatic.**

## Current assignment

**Side-kick drill** (`swim-side-kick-drill`, minted 2026-09-02), then 6-3-6 as the bridge. Full prescription lives in the workout file.

Chosen because it hits every symptom he named with a single drill: it forces rotation, forces the legs to work (on your side, no kick = no movement), teaches breathing off the roll rather than the neck, and parks the arms so they can't compensate.

**Drills go first, while fresh.** A drill done tired grooves the bad version.

## Backlog — not yet, in rough order

1. **Rotation must become automatic first.** Everything below waits on it.
2. **Catch / high elbow** — `swim-catch-up-drill`, `swim-fingertip-drag`, `swim-fist-drill`, `swim-sculling` all already exist in the library. This is where the lifting strength finally becomes useful rather than a crutch.
3. **Kick cadence** as its own topic — he flagged "leg cadence" in the original brief and it hasn't been addressed on its own terms yet, only via rotation.
4. **Bilateral breathing rhythm** — confirm whether he's actually on every-3 or something else; worth pinning down once rotation settles, since the count is what makes it automatic.

## Open questions

- **Stroke count baseline** — asked for, not yet collected.
- *(Pool is outdoor, answered 2026-09-02. Phlegm question closed by him — see below.)*

### Phlegm — CLOSED BY HIM (2026-09-02). Do not raise again unprompted.

> *"yeah idk or just my ear/nose does that from beathing too much dry air pobably, its fine, its common even when not exercising so whatever haha"*

**It's baseline for him and happens outside exercise entirely, so it is not a swimming finding and not a limiter to solve.** He closed it himself; treat it the same as the left-arm thread — settled unless HE brings it back. The analysis below is kept only so it isn't re-derived from scratch if he ever does.

<details>
<summary>Prior analysis (superseded)</summary>

#### Read at the time, revised for an outdoor pool

The chloramine theory is mostly dead — outdoor pools gas off into open air, so the concentrated irritant layer that sits over an indoor pool doesn't build up. Remaining candidates, in rough order:

1. **Airway cooling and drying at high ventilation.** The plain mechanism, and it happens outdoors too. Notably, **"around lap 20" is a TIME marker, not a distance one** — that's roughly 15-20 min in, which is exactly the window exercise-induced airway narrowing typically shows up in (5-15 min into sustained effort). The consistency of the timing is the tell.
2. **Allergens on the surface layer.** Outdoor pool, Bay Area, late summer/autumn. Pollen and debris settle on the water surface, and his breathing zone during freestyle *is* the surface. Cheap test: swim at a different time of day (pollen usually peaks in the morning).
3. **Plain mucus mobilization** — horizontal position plus post-nasal drip. Benign, and the least interesting.

**It also only shows up when he's swimming easy** (*"if i swim really lazily it's like phlegm"*) — when he's working, the shoulders give out first and he never gets there. So it may be a duration effect that hard swims simply end before reaching.

</details>

## Notes on running this thread

- **Video is optional and modest, not a multiplier.** Still frames are readable; motion is not. A still mid-breath and a still mid-stroke with the lead arm extended will show head position, hip roll, and whether the legs trail low. Rhythm, timing and catch can't be judged from stills. *(I originally overclaimed this AND wrongly described filming as an established habit — he corrected me: "i'm not filming squats??" The filmed squat set is a proposed step in the W28 legs self-diagnosis, never something he does. Don't describe proposed protocol as established practice.)*
- **Sequence swims against pull day, not legs.** Swimming is lat/shoulder work — it stacks with pull and barely touches legs. His own instinct was right: swim then legs is the low-conflict pairing.
- **The right shoulder is the thing to watch, not the volume.** Freestyle recovery is a big overhead arc and that shoulder has a long history. Volume is cheap; a crabby right shoulder is the signal.
