# Swim Coaching Log

Started 2026-09-02. Swimming entered the program during W28 (newborn period) unprompted — the apartment pool is downstairs, which is the whole reason it works right now. He then asked to open it up to the same back-and-forth coaching loop as lifting: *"i've never actually taken swimming classes would be cool to use this opportunity to improve on my swim as well, through this kind of writing feedback / back and forth."*

**Poolside:** Programs → **Swim Technique** (`programs/swim-technique.json`), a flat pick-whenever menu: Full Session (`swim-technique-rotation`), Kick Drills (`swim-kick-block`), Rotation Drills (`swim-rotation-block`). The drill blocks are flow bundles and the full session references them by `flowId` — **each drill's cues live in exactly one file; edit the block, not the session.** The notes page (`static/notes-swimming.md`) hangs off this program. This file is the coaching context behind all of it.

---

## The brief

**Technique only. Explicitly not speed.**

> *"i just want better technique in the water lol; i dont care if i'm fast or not i just want good breathing / stroke / swim / leg cadence"*

- **Never frame feedback around pace or time.** No stopwatch, no intervals-for-fitness, no "faster."
- **Volume stays untracked**, same as the KB days and same as `feedback_fuzzy_progression_goal`. The lap count is not the progression and is never owed.
- **Stroke count per length is the one allowed number** — it measures efficiency, not effort, and it goes DOWN as he improves. Ask for it; never ask for a split.
- He has watched enough YouTube to know the concepts. **Don't explain theory at him — give drills.** *"i've seen enough youtube to know what i'm supposed to be doing; nothing is very automatic tho."*
- **This is PRACTICE, not a training load. Stop modelling it as fatigue.** *"i just like the swim - i dont swim hard though, its only practice; i think about breathing and rolling, i dont try to push for speed at all, esp following your instructions."* **The right analogy is the morning flow** — it's in the week, it's low intensity, it's skill work, and nobody asks whether the morning flow interferes with push day. Don't build interference models around it, don't budget it against gym days, don't treat lengths as volume.
- **Why he swims: *"no its just bc water feels nice."*** That's the whole reason and it doesn't need building out. I framed it as a retention insight and he flattened it — don't add strategy to it, don't turn it into a metric or a target or a thing he owes.

## The swimmer

| | |
|---|---|
| **Pool** | Apartment pool, but a real short-course lap pool with lane lines and dividers (~25m/25yd). His "half-length" meant half-Olympic. No length constraint on technique work. |
| **Stroke** | Freestyle throughout. |
| **Breathing** | Bilateral, alternating sides. Left is comfortable, right is the one he's actively working. Already exhales underwater — **this was never a problem, don't re-coach it.** |
| **"Lap"** | Means **down and back** to him (2 lengths). So 30 laps ≈ 60 lengths ≈ 1500. Volume is much higher than the word "laps" first suggested. |
| **Head** | Working on keeping the chin tucked-ish. Instinct is right; just needs to stay neutral rather than jammed. |
| **Background** | Lifter. Former V5/V6 boulderer. Strong lats, strong shoulders, strong grip. |
| **Gear** | No kickboard. |

**Sessions:** W28 Sun 20 laps → Tue 30 → Wed 30 (held at 30 instead of the planned 40 after the soreness conversation — good call, and he made it himself) → 2026-09-07 30 laps / 60 lengths, first session with the drill assignment → W29D2 (reported 2026-09-10) 20 laps of side-breathing drill + 10 laps full stroke. Soreness during the W28 ramp was the ramp, not the swimming; it settled once volume stopped climbing, and volume has been flat at 30 since.

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

### 2026-09-07 — first run of the assignment, and he felt the payoff before being told to look for it

> *"did another 30 laps (60 len) - super slow and practicing rolling and head down - definitely getting better at right side, still needs work; feels like i'm gliding forward more tho! thanks for the tip super helpful"*

**"Gliding forward more" is the whole point of rotation, and he reported it unprompted.** Nobody told him to look for glide — the prescription talked about rolling the hips and about the right side. A rotating swimmer presents a narrower body to the water and each stroke carries further before it stalls, which is felt as gliding. That is a body-position change, not an effort change, and it is the single most convincing thing he could have said.

**He has also described a lower stroke count without counting one.** More distance per stroke IS the number. Worth collecting now that there's something to measure.

**The right side improving is the diagnosis confirming itself.** The read was that the right-side difficulty was never a right-side problem — it was the flat-swimming habit surfacing on the side that couldn't paper over it. It got better when rotation got better, without being worked directly. That is what the diagnosis predicted, so the prediction paid.

**He swam it slow, self-selected.** *"super slow"* — no instruction to that effect beyond the watchpoint. Drilling at drill speed is the thing most people won't do.

**Hold the assignment. Do NOT advance to catch/high elbow.** Rotation is improving but he said "still needs work," and the backlog rule stands: everything waits on rotation being automatic. Improving is not automatic.

**One refinement, no new material — weight the side-kick drill 2:1 toward the LEFT-side-lying position** (left arm extended forward, right shoulder to the sky). That is the position that trains right-side breathing, and it's the side still catching up. Written into the workout file. This is an allocation change, not added volume.

#### Follow-up same day — one root cause under both remaining symptoms

> *"i feel like i'm going faster, but i'm actually spending way less energy on trying to go forward - a lot more energy is going into rotating and esp getting the right side rotated out of water; still get water in mouth when breathing sometimes (left side is fine / no problem at all)"*

**Faster on less propulsive effort is the efficiency win, stated cleanly.** He moved energy out of pulling and into position, and got speed anyway. Do not congratulate the speed — congratulate the trade, since speed is explicitly not the brief.

**The diagnosis to carry forward: he is rotating TO breathe, instead of breathing on a roll that was already happening.** Both remaining symptoms fall out of that one thing:

- *"getting the right side rotated out of water"* costs energy because he arrives at the breath flat and then has to heave the shoulder up. If the body were already on its side, the face would be nearly clear and the breath would be almost free.
- **Water in the mouth is a LATE roll, not a small one.** Arriving flat means the head turns after the window has passed, so the mouth comes up over the bow wave instead of sitting in the trough beside it.

**Left being fine and right not is the same lag as before, not a second problem.** The left side gets the roll it needs because it is the grooved side; the right exposes that rotation isn't yet continuous.

**Cues added to the workout file — no new drill, the assignment already contains the fix:**
1. **Lower goggle stays in the water.** You breathe in the trough beside your head, below the flat surface — lifting for air leaves the trough and finds the wave.
2. **6-3-6: breathe during the 6 kicks, not during the 3 strokes.** He is already fully on his side there, so that breath costs nothing — that's the sensation to steal for real swimming. The drill was always the answer to this; it just wasn't pointed at it.
3. **Main swim: roll on EVERY stroke, not just breathing strokes.**
4. **Lead arm long and patient** — on a right-side breath the LEFT arm is out front, and if it presses down early the shoulder drops and the mouth goes under.

**Rotation costing energy right now is expected and temporary** — it's a new motor pattern being run consciously. It becomes cheap when it becomes continuous. Don't let him read the effort as a sign he's doing it wrong.

**Stroke count still uncollected** — he forgot, deliberately deprioritized it in favour of getting comfortable rotating. That was the right call and it was his own; the number waits.

#### Gap in the prescription he found himself — "how do you not sink with the arms parked?"

The side-kick note said *"expect this to be humbling — if you're wobbling or sinking, that's the drill telling you the truth."* True, and useless: it named the problem and offered no remedy. **A drill that only fails informatively is a badly written drill.** Fixed in the workout file.

The answer he needed: **arms were never what held him up.** Flotation comes from the chest — lungs high, dense legs low — so the fix is to **lean on the sternum** and let the body seesaw over the lungs. The extended bottom arm is a balance lever (long, and slightly DOWN, not reaching for the surface), not a paddle. Pointed toes, or the foot is a brake. And if it still sinks, **cut to half a length** — a wobbling full length grooves the wobble.

**Worth knowing about this swimmer specifically: his legs really do sink more than average.** Muscular lifter, dense legs, low leg body fat. That is real and not a form failure; don't let him chase a positional fix for a density problem. It makes the chest-press cue more important for him than for most.

**Ankle note, held honestly:** kicking needs *plantarflexion* (pointed toes); his squat limiter is *dorsiflexion*. Opposite directions of the same joint — **do not assume the squat finding transfers here**, and don't sell swimming as ankle work for the squat.

#### 2026-09-08 — what swim fatigue feels like, and why it won't warn him

Swam Sun 2026-09-06, lifted push Mon 2026-09-07 on ~3h of sleep. He ruled the swim out as a cause himself, correctly, and then described the residue precisely:

> *"i dont think the swim was a cause; did feel the burn from it today tho but not like muscle fatigue"*

**That distinction is real and it has a mechanism: freestyle has almost no eccentric component.** The pull is concentric; the recovery arm is unloaded. DOMS comes overwhelmingly from eccentric loading, so swimming produces metabolic/pump fatigue with none of the next-day structural soreness lifting trains him to expect.

**The consequence worth acting on: soreness is a broken gauge for swim volume.** Every other thing he does reports back the next morning. Swimming won't, so volume can climb without the usual feedback. **The signals that DO work here are the right shoulder and the quality of the roll** — not how he feels the following day.

**Sunday is the one slot that puts 60 lengths of overhead arc right before push day.** Not implicated in this session — 3h of sleep and a reordered workout explain it completely — but if swims go weekly, mid-week next to legs remains the low-conflict pairing, as he originally guessed.


### W29D2 (reported 2026-09-10) — first stroke counts, and the kick surfaces as the limiter

> w29d2
>
> did 20 laps of side breathe practice and another 10 of just swimming both sides
> - slow stroke without stroking while breathing is 8-9 one side to another
> - if i stroke in the water between breathing it’s about 18-20 but faster
> - rolling and breathing is really speeding me up!
> - kicking and side breathing still wears me down / get tired from kicking

**Stroke count baseline: ~18-20 per length, full stroke.** That's the number. The 8-9 is a different measurement — in his "side breathe practice" he strokes only between breaths and kicks through each breath on his side (reads as 6-3-6-style), so the kick covers part of the length. Told him to ignore the drill count. Don't grade the 18-20 — it only means something against itself.

**The roll is speeding him up — second unprompted report in a row** (glide last time, speed this time). Same finding, nothing to act on, don't congratulate the speed.

**The kick is the new limiter.** Two parts, held separately:

- **Dose — explains it on its own.** The side-breathing drill is kick-powered: during every breath pause the kick is the only engine. He did ~40 drill lengths against ~10 on the sheet. Not a volume problem (volume stays untracked) — the problem is that drill quality goes when the kick tires, and drilling past that grooves the ragged kick. **Gave him a quality stop signal, not a length cap:** kick goes big and ragged → stop drilling, swim.
- **Kick size — probable, not established.** Fits the 2026-09-02 caveat (legs never feel like they sink → maybe kicking hard enough to hold them up) and fits dense legs. Not a finding, since the dose already explains the fatigue. Sheet cue softened from "small fast kick" to "small, relaxed kick — knees nearly straight, ankles loose"; one-length kick-on-back check added to the cooldown (knees breaking the surface = knee-driven kick). Asked where the legs tire.

**The original complaint was the opposite:** *"legs should be working more than they do."* The drill was chosen partly to make the legs work, and now they do. Tiring is the expected first result of that, not a second problem.

**Hold the assignment.** No new drill — the fixes were already on the sheet (small kick from the hip, lean on the sternum). This round added a stop signal and a check.

#### Follow-up — thighs + hip flexors, and it's breath, not muscle

> I get tired on the thighs and hip flexors, and it's mostly just I just get out of breath like I've sprint in and out of breath it's less muscle tiredness and I get tired in all both full stroke and drill length right side I get a little bit of mouth water but it went so much better and the full stroke swim on the last ten laps it felt natural and I never got water in my mouth, which was something that's never happened before  She's fatigue, so I should probably keep working on legs right I'm not very good at this, so whatever

**First session ever with no water in the mouth** — the last 10 laps of full stroke, which also "felt natural." Right side still takes a little water on the drill lengths but "went so much better." That's the late-roll diagnosis paying: arrive on your side on time and the trough is there. **Closest thing yet to automatic, but one session isn't automatic** — drills stay.

**The dose explanation was incomplete.** He tires in full stroke too, not just drill lengths. Thighs + hip flexors is the too-big kick on the mapping (thighs = knee bend, hip flexors = amplitude), and the dominant sensation is breathlessness at a slow pace, *"less muscle tiredness."* Legs are the biggest muscle mass; a big kick is the most oxygen-expensive, least-propulsive part of freestyle. **Working read: kick too big. Still a read, not a finding** — the test is cheap and on the sheet.

**His question — "keep working on legs?" Answer given: yes, but the work is kicking LESS, not kick fitness.** Kick conditioning would be the lats trap again: fitness that lets him keep the expensive version. Don't prescribe kick sets.

**The test:** once the roll feels natural in the main swim, the one thought swaps to "smallest kick you can get away with." Breathing calms + legs stay up = that's his kick. Legs sink = lean harder on the chest before kicking harder. Effort watchpoint rewritten to name a big kick as the cause of being winded at a slow pace.

**Deliberately not touched: breathing pattern.** Every-2 vs every-3 could also feed the breathlessness, but changing it now would confound the kick test. One variable at a time; revisit only if a small kick doesn't calm the breathing.

**He already rests when winded:** *"But I notice you get slow Anthropic just take a longer break like for the lifting like two minute break there's a clock in the wall so I just do that."* ~2 min at the wall by the pace clock, like lifting rest. Right call for skill work — every length starts fresh. Sheet tip now says rest until breathing settles; the 20s rest numbers in the file are not owed. If the small kick works he'll want the wall less — don't count it.

#### Kick opened properly — he asked for drills and the mechanics

> This has been surprisingly helpful from only one session, so expert congratulating me, but I think you are the one that needs the congrats here. So with that said, can you give me some proper drills or do some kind of walkthrough on how I can get better at kicking I feel like my legs are just failing What part of the body is even supposed to exert and move

**He asked for mechanics directly** (*"what part of the body is even supposed to exert and move"*), so the no-theory rule yields here. Walkthrough went to the notes page (Kicking section); drills went to the sheet.

**Kick Block added to the sheet, first after the warmup while the legs are fresh:**
- **Wall kick** (`swim-wall-kick`, minted today), 3 × 20s. Takes away travel and breathing so he can feel hip initiation, loose knees, floppy ankles.
- **Kick on back, arms by sides** (`swim-kick-on-back`), 2 lengths. Face out, so the breath limiter is gone and it's just the kick; knees breaking the surface = knee drive. Moved up from the cooldown check, so the cooldown is plain backstroke again (swap, not add).

**Deliberately not used:**
- **Kickboard.** Head-up kicking drops the hips and arches the low back — bad with dense legs and his QL history. Also an aid.
- **Vertical kick** (`swim-vertical-kick` exists). The best knee-drive teacher, but oxygen-expensive and needs a deep end, and breath is his limiter. Revisit once a small kick is easy.
- **Fins.** Mentioned once on the notes page; not re-offered.

**Where this goes next: kick RHYTHM.** A 2-beat kick tied to the roll is the eventual answer to his original "leg cadence" ask and to easy long swimming. Not until the small kick is easy.

**"From the hip" didn't land:** *"Okay, I don't have a kickboard, but also I have heard this kick from your hip. What the heck is a hip? Like, is that the walking muscle? Like what is the hip like what muscle is there? Like is a tweeking muscle like what is it?"* Anchored it to walking (hip flexors swing the leg forward, glutes push it back), the couch stretch and the RDL, plus a standing straight-leg swing as the dry-land feel. Added to the notes page. **Swim cues don't land just because he knows the body part from lifting — anchor each new cue to a movement he already does.** Follow-up, hip vs pelvis: the sheet uses "hips" both ways (6-3-6's "let the hips lead the shoulders" = pelvis; "kick from the hip" = the joint). Clarified on the notes page.

#### Swim becomes its own program — and "spell it out"

> Okay, I'm sorry what is the six three six drill and could you spell that out for the next one also how is there a swim drill built up maybe it should be like a program like the other ones except maybe it's not time by the day and then give me these cake drills and six three six and whatever that is yeah just pot them up on me it'll probably just pick them up whenever I feel it but still kick from the hip from the joint I don't even know if it muscles though you know

**He didn't know what 6-3-6 was** — the name had been in chat and on the sheet for a week without ever being spelled out in a reply. **Rule: the first mention of a drill says what you physically do.** Every drill note on the sheet now opens with a plain what-it-is line.

**Restructured as a program, per his ask:** flat pick-whenever menu (same pattern as `maternity-swim-daily`), drill blocks as flow bundles so the cues aren't duplicated across sessions. Notes page moved from functional-bulk's `pages` to this program (same slug). The overview lists the build-up: rotation → kick → catch → rhythm.

**Joint vs muscle** — answered: the joint is the pivot and the muscles around it move it; anchored to the RDL hip hinge.

#### 2026-09-15 — reported live from the pool: the float landed, and a fundamental breathing gap surfaced

He chatted through the session from the water. Ran in written order — back kick → side-kick → 6-3-6 → 20 lengths of main swim — then out to cook, which he had flagged in advance.

**⭐ THE FLOAT LANDED, AND THE BACK-KICK DRILL IS WHAT TAUGHT IT.** *"the back kicks helped me understand i can just float and keeping some air in lungs help - i can just float on the side kicks without think ill sink so thats something new!"* The sinking gap was written up 2026-09-07 and answered in prose then; **it did not land until he felt it face-up with nothing to manage.** The order that worked — prove the float on your back, then carry it onto your side — is now a cue on the sheet and the notes page.

**Back kick first read badly, and the fix was the head.** *"legs sink a lot to keep head up but also exhausted after both lengths?"* Chin tucked to look at his feet → hips drop → he kicks hard just to stay up, which is exhausting inside one length. Given: head back, ears under, water at the goggle line, shoulder blades pressed down, ribs down. **The sheet said "head back, eyes on the sky" and never named the thing that breaks it — the chin tuck is now written in as the fault to catch.**

**⭐ THE REAL FINDING — HE DID NOT KNOW HALF THE FACE STAYS IN THE WATER ON A BREATH.** *"you're always supposed to put half your mouth in the water????"* Five weeks of "water in the mouth," and underneath it was a model in which a breath means getting the **whole** mouth clear — which requires lifting the head, which drops the hips, which is the sinking. **The trough cue was on the sheet and the notes page the entire time and could not land, because it was answering a question he did not know he was asking.** Same class of failure as 6-3-6 never being spelled out: a cue that assumes a model he does not have. Now stated plainly in both places — one goggle in, one out, sip from the top corner, blow all the air out underwater so the inhale is quick.

**A cue on the sheet was actively wrong, and he found it by trying to follow it.** Side-kick said *"eyes straight down at the bottom of the pool"* AND *"lower goggle under, upper goggle out"* — mutually impossible on your side. He arrived from the other end: *"lower goggle in the water but still looking up towards the sky ish right? otherwise water gets in both sides."* **Corrected to: head in line with the spine, face at the side wall; water on both sides means the body is not all the way over, so roll the body rather than re-aim the face.**

**The kick-size test is answered — see Open questions.** *"kicking even the tiniest amount makes me feel tired around hips and psoas... but it doesn't feel like a need to kick just to breathe."* The breathlessness is gone; what is left is local hip-flexor fatigue. Read as pulling the leg forward on the upbeat instead of letting it rebound. **Cue given in the pool, deliberately not yet on the sheet** — one change at a time, and put it in writing only if it repeats.

**Main swim: 20 lengths, and a third consecutive unprompted glide/speed report.** *"feels lighter / faster on quieter swims... tried to swim a fast one and definitely felt less drag throughout."* He called the leftover tiredness normal himself. **Stroke count not collected** — he was tired and in the water; ask next time, do not chase it.

**He bailed before the full main swim exactly as he predicted, and it cost nothing.** Drills ran first, which is the entire reason that order exists.

**Next-day report (2026-09-16): not sore, but tired and “doms-y.”** *“i'm not sore but i'm still tired / feel doms-y haha.”* The no-soreness half was predicted and held — freestyle has almost no eccentric loading, so it does not report back the way lifting does. The tired half is systemic fatigue, not muscle damage, and it stacked on a push day two days earlier. **The one place genuine local soreness could show up is the hip flexors from the kick** — next time, ask him to separate “tired all over” from “this specific spot is tender,” because only the second is the kick reporting back.

#### 2026-09-18 — the kick cue landed, and he found a better version of it than the one I gave him

> all the exercises are great getting way more confidence and finding that pocket you mentioned. last ten lengths of swim i noticed if i swim very chill - very little paddling and very little pulling of arms i get 19 strokes if i push regular hard it's about 17 - does that mean im dragging normally

> focused on kicking back / feeling bottom of feet like i'm jumping off of something - no hip flexors here- catching myself if i feel myself pulling legs forward

**⭐ THE HIP-FLEXOR BURN IS ANSWERED, AND IT IS GONE.** The 2026-09-15 read was right: the burn was him hauling the leg forward on the upbeat rather than letting it rebound. Given the cue as "the up half is free"; **he came back with the better cue — the bottom of the foot, like jumping off something.** That is a PUSH framing rather than a DON'T framing, and it anchors to a movement he already has, which is the thing swim cues keep failing on. **His words go on the sheet, not mine.** He is also self-correcting mid-length (*"catching myself if i feel myself pulling legs forward"*), which is what a cue that has actually landed looks like.

**The trough landed too** — *"finding that pocket you mentioned."* Third piece of the breathing model in three sessions (float → half the face stays in → the trough).

**Stroke count, first proper pair: 19 chill / 17 pushing.** He asked whether the 19 means he is dragging on the easy swim. **Answered: no, and the intuition is backwards.** Pushing harder lowers stroke count for every swimmer at every level — a harder pull travels further per stroke. Drag rises with speed (roughly v²), so the chill length has *less* drag, not more. The count is a power reading, not a drag reading.

**The real signal is the SIZE of the gap: two strokes**, from a chill length he described as *"very little paddling and very little pulling of arms."* Near-zero arm propulsion to full effort bought two strokes. Two readings, indistinguishable on a stroke counter:
1. Body position is good enough that he glides nearly as far without pulling (what the rotation block was for).
2. The pull is not adding much — the catch slips, effort goes into the water instead of into him.

**Deliberately did NOT put this on the sheet.** The separator is time, and he already uses the wall clock, so it was given as one question asked once — does the 17 arrive *obviously* sooner than the 19 — not as a metric to track. **The swim is practice; do not build a dashboard on it.**

**Both 17 and 19 sit at or under the old 18-20 baseline, on a swim where he was not trying.** Framed as the floor moving, once, without ceremony.

**⭐ THE PULL QUESTION IS ANSWERED SAME-DAY, AND THE CATCH IS NOT THE LEAK.** He went and timed it.

> regular effort is 17 strokes and 53s for two lengths; lazy stroke is 60s for 19 strokes

**Stroke RATE is identical in both swims — that is the whole finding.** 17 strokes / 26.5s = **0.64 strokes/sec**; 19 / 30s = **0.63 strokes/sec**. His arms turned over at the same tempo whether he was pushing or loafing, so **100% of the speed difference came from distance per stroke, none from cadence.** Robust to a second or two of hand-timing error — it would take a much larger error to move it.

**That rules out a slipping catch.** A slipping catch churns: leaning harder would mostly spin the arms and he would have needed more tempo to gain speed. He held tempo, added force, and got distance back. **The catch block stays on the backlog as the eventual source of more distance per stroke, but it is NOT an urgent leak and should not be moved up.** Reading #1 from the morning was correct — body position is carrying him.

**The second read is the one worth acting on: the hard swim is a bad deal.** 60 → 53s is ~13% faster. Drag goes with v² and the power to beat it with v³, so ~13% more speed costs roughly 40-45% more work. **That is physics, not a fault** — told him so explicitly, because "huge effort, barely faster" is exactly the observation that makes people conclude their technique is broken. **The 19 at 60s is the swim worth owning; if the count drops it should drop on the chill swim.** This also retro-validates three consecutive unprompted "feels lighter/faster on the quiet swims" reports — his instinct read the physics before the clock did.

**Do not turn this into a tracked metric.** It was one question asked once and it is now answered. No SWOLF, no logging pace. The swim stays practice.

**Watch that "jumping off something" does not grow the kick.** It is a press, not a range — the marker is the boil at the surface staying small, and the front of the thighs staying quiet (thigh burn = knee drive). Nothing to act on yet; he reported neither.

**He ran the whole sheet and it cost him less than usual.** *"ok just finished the entire workout today; felt good less tired than usual for the number of laps done so i think im getting more efficient"* — **first session he has finished end to end** (2026-09-15 he bailed before the full main swim, by design and at no cost). His read, logged as his read: less tired per lap. **Plausible mechanism and nothing more** — the big kick was the oxygen-expensive part and it is gone, which is exactly what should show up as "same laps, less tired." One subjective session; do not promote it to a finding and do not build a fatigue metric to chase it.

**⭐ THE RHYTHM GAP, IN HIS OWN WORDS — AND IT IS THE RIGHT DIAGNOSIS.**

> lmao my kicks are like - that game where you pat your head and rub your tummy - nothing is in sync and i think during turning my kick slows or stops

**He is running arms and legs as two independent supervised programs.** That is the normal self-taught state and it is not a coordination deficit — it is a model problem, and the answer is not "get better at multitasking." **Answered: freestyle does not sync arms to legs, it syncs both to the HIPS.** The roll he has spent weeks building is already a hip rotation, and the kick is a hip movement — same joint, same motion. Framed to him as collapsing two programs into one, which is *less* to hold, not more.

**"My kick slows or stops during turning" is the same fact from the other side** — the kick dies exactly when attention goes to the roll, which is the proof that it is currently a separate task. Once the roll drives the kick it cannot die during the roll. **Read as the breathing roll, not the wall turn — he was not asked to disambiguate, so treat the wall reading as still possible.** Told him the wall version would be uninteresting if that is what he meant.

**I reversed my own recommendation, in the same conversation, and said so.** An hour earlier I argued for one more settling session before adding rhythm, on the grounds that a fourth thought competes with three that just landed. **That argument was wrong once he described the pat-head/rub-tummy problem:** rhythm is not a fourth thought, it is the one that collapses two of the existing ones. He asked for the block.

#### Rhythm block built 2026-09-18

**`swim-rhythm-block`** — two moves, length-neutral, **swapped IN for the rotation block in the full session** (10 drill lengths either way). The rotation block stays on the à-la-carte menu; a watchpoint on the sheet points at it for any day the roll or the breathing needs isolating on its own.

- **`swim-6-1-6-drill` (minted today, 6 lengths)** — six kicks on your side, ONE stroke to switch sides, six kicks there. **Deliberately the 6-3-6 he already knows with the three strokes cut to one**, so the switch has nowhere to hide: one roll, one kick. Spelled out in plain words at first mention per the standing rule. **The named fault is the kick going quiet during the switch** — and the instruction when it does is to slow the drill down, never to kick harder. **Side-kick is not lost from the session** — 6-1-6 contains the side-kick position.
- **`swim-single-arm-freestyle` (already in the library, 4 lengths)** — reused rather than minted. Halves the arm information so the pairing is felt directly: one arm pulls, one kick lands. **Lead arm stays extended forward**, per the established balance-lever cue.

**Main swim one-thought swapped** to "let the kick land ON the roll." The roll-on-every-stroke cue was NOT deleted — it moved to a supporting bullet, because it is the motion the kick now rides and it has to be present on the non-breathing strokes too.

**Spotlight moved** from side-kick to 6-1-6. **Stroke-count watchpoint amended** to say count it on the EASY swim — the fast number is not the one to chase (see the timed pair above). **Catch stays where it is on the backlog.**

#### 2026-09-22 — the drill showed up inside the swim, on the side that has always lagged

> got in! switch felt good! it's draggier than 636 but forcing me to think about roll and leg kick - still need practice tho. did twenty laps after. sometimes i find myself needing to slow down on regular laps and go into 636 mode on the right / just paddle on the left and breathe right

**Second swim in two days** — Mon 2026-09-21 (gym skipped, too tired) and Tue 2026-09-22 (gym skipped, jury duty), both on the full sheet. Twenty laps after the drills. **Not a load question** — the swim is practice and stays uncounted.

**"Draggier than 6-3-6" is correct, expected, and not a fault.** Six kicks to one stroke means he is travelling almost entirely on the kick, and the kick is a weak engine by design — the kick-on-back note already says moving slowly is normal. **It is less propulsion, not more drag**, which is the same distinction as the 19-vs-17 stroke-count conversation. Said so in one line rather than letting "draggy" sit there reading as "doing it wrong."

**⭐ THE MID-SWIM RESET IS THE DRILL TRANSFERRING BY ITSELF, AND IT IS ON THE WORKING SIDE.**

*"go into 636 mode on the right / just paddle on the left and breathe right"* — left arm out front, right shoulder to the sky, breathing right. **That is exactly the left-side-lying position the side-kick drill was deliberately weighted 2:1 toward on 2026-09-07**, precisely because it is the one that trains right-side breathing. He was never told to use it mid-swim; he fell into it when he needed air. **A position you can fall into and rest in is a position you have.** That is the drill leaving the drill lengths on its own, which is the only kind of transfer worth anything.

**It happens on the right, which is the side that has lagged since day one** (bilateral, left comfortable, right the one being worked). Same lag, not a new problem — do not open a second thread for it.

**Two readings of WHY, with different fixes — not disambiguated, so do not assume.** (a) He is out of air and buying time, which is about the breath not yet being free at full stroke rate; (b) the roll arrived late, the breath got awkward, and he drops to the side to re-find the position — which is the late-roll habit surfacing under fatigue rather than a breathing issue. **Asked him which.** Also unresolved and cheaper: whether "paddle on the left" is the lead arm sculling to hold position, or actual single-arm strokes. Either is fine; it just changes what to call it.

#### Follow-up same day — the answer was neither option, and it is better than both

> it's because i force myself in it - otherwise im not getting a roll in, im forcing myself to not take the shortcut ; left side is super easy and feels like rest; right side if i get in it it feels good but if im just swimming i feel myself taking shortcuts and not rolling

**I offered two readings — out of air, or recovering a late roll — and he gave a third.** He is not resting and he is not recovering. **He is manually inserting a roll he would otherwise skip.** Record that the two-option framing was wrong; the reset is a self-correction, not a fallback.

**The shortcut he catches himself at is the original diagnosis, still alive on the right only.** 2026-09-02: a head-turner gets away with it on the comfortable side and is exposed on the other. That is exactly what *"left side is super easy and feels like rest; right side... i feel myself taking shortcuts and not rolling"* describes. **Not a new thread — the same one, at a later stage.**

**What has actually changed, and it is the part worth naming: the right-side roll is available but not yet default.** *"if i get in it it feels good"* — the position works, it is not hard, it is not a strength or mobility gap. What is missing is that it does not happen unless he decides. **Drills build a position; they do not make it the default.** Distinguish these two problems in everything going forward — the prescription for "can't" is not the prescription for "doesn't unless supervised."

**He is also now catching it mid-stroke, which he could not do before.** Noticing the shortcut as it happens is the step before not taking it. Do not congratulate him for it; just do not mistake it for the old "right side is hard" report, because it is a different sentence.

**⭐ WHY THE SHORTCUT EXISTS, AND WHY THE ANSWER IS ALREADY ON THE SHEET.** The shortcut is available because on the right, the roll's only job is to get air — and turning the head also gets air, more cheaply. **A roll that exists only to breathe will always compete with head-turning and will sometimes lose.** The rhythm block is the structural fix, not more forcing: when the kick rides the roll, every stroke has a roll in it, the roll stops being a breathing device, and there is no un-rolled stroke left to shortcut into. **This is the already-written "still roll on EVERY stroke, not just the breathing ones" cue, and his report is the first real evidence of why that bullet matters.** No new material — the live block is the answer.

**Told him to keep forcing it.** A manual phase is how a default gets replaced; there is no route to automatic that skips it. **The marker given, deliberately not a number:** the tell is the first time he notices he rolled on the right without having decided to. That is the floor moving, and it fits how he wants progress framed.

**Sheet bullet corrected same day.** Yesterday's version asked him to notice which of my two wrong reasons it was. Rewritten to what he is actually doing — force the roll in when he catches the shortcut — with the notice-you-rolled-without-deciding marker.

#### Reported live from the pool, 2026-09-22 — "I've been mostly using arms"

> ok so the kick is the thing and only thing driving ant rotation? i've been mostly using arms. tried 616 with no arms at all last lap and it worked surprisingly well with arms by my side?

**Answered NO, and corrected the overcorrection immediately.** The kick does not drive the roll. **The hips and trunk drive the roll**; the kick is part of the same hip motion and lands on it. Letting "the kick drives rotation" stand would have traded one wrong model for another, and he would have started kicking harder to steer — the exact failure mode already flagged for "jumping off something."

**⭐ THE DISCLOSURE IS THE FINDING: he has been rolling with his arms.** Unprompted, after weeks of rotation work. **Arm-led rotation turns the shoulders while the hips stay flat** — which is flat swimming wearing a roll. It explains the whole right-side pattern in one line: a shoulder-roll is enough to get air on the easy side and not enough on the other, so the right is where it fails and where he feels himself "taking shortcuts." **Same root as everything since 2026-09-02, now visible from the inside.**

**His own experiment is the proof and he ran it himself: 6-1-6 with no arms at all, arms at his sides, and it worked.** That is the cleanest possible demonstration that **the roll does not need the arms** — with no arm available, the roll still happened, so the driver is in his middle. He found the answer to his own question one lap before asking it. Also worth noting: no lead arm means no balance lever, and it still worked — his float is good enough now that the lever is not load-bearing.

**Cue given, anchored to throwing:** hips go first, the arm arrives last. Do not build a new anchor for this; throwing is universal and he did not need a lift analogy.

**Possible sheet addition, deferred deliberately:** a no-arms length as a variant note on 6-1-6 — not a new exercise, not a new block. **He was mid-session; nothing built while he is standing at the wall.** Add it only if it is still useful on the next report.

#### Same session — breathing pattern pinned down, and the roll is on the non-breathing strokes

> uhhhh i don't know what that means. i breathe left, stroke three times then breathe right then stroke three times then left; the hip is rotating into the breathing but also when head down and stroking

**BACKLOG ITEM 4 IS ANSWERED: he is on every-3 bilateral.** Alternating sides only works on an odd interval, and "three" matches, so every-3 it is. **It is the right pattern and it stays untouched** — asked only to write it down, told him explicitly nothing was changing.

**The 3-against-2 explanation did not land and that is on me.** He used the word "polyrhythmic" and I answered inside it; the reply came back *"uhhhh i don't know what that means."* **A technical word he borrows is not permission to answer in that vocabulary.** Re-answered in plain words: his breath walks around the pattern instead of landing in the same place. Memory updated ([[feedback_spell_out_swim_drills]]).

**⭐ *"the hip is rotating into the breathing but also when head down and stroking"* — that is the whole point, reported from the inside.** The roll on the NON-breathing strokes is what stops the roll being a breathing device, and it is the structural answer to the right-side shortcut from this morning: a stroke that already has a roll in it has no flat version to fall back on. **Same day as the "I've been mostly using arms" disclosure** — he went from rolling with his shoulders to reporting hip rotation on the head-down strokes within one session. Do not smooth this into a finding yet; it is one session and it was heavily supervised. **The test is whether it survives when he stops thinking about it.**

**Roll SIZE came up and the sheet had no answer for it** — every cue said roll on every stroke, none said how far.

> getting the rotations down is effortful tho i feel like when arms down heads down stroking its mini rotations not far enough my head can just come out - to conserve energy lol

**His instinct is right and was confirmed, not corrected: a small roll is the correct roll.** The fault was never roll size, it is roll *consistency*. **The head clears because it turns, not because the body rolled far enough** — a roll big enough to free the face on its own is over-rotation. Told him the breathing stroke gets the same roll as the others plus a small head turn, and that needing MORE roll to breathe is the lurch being rebuilt under a new name.

**Calibration given in a position he physically knows: about half the drill position.** No degrees, no jargon — the side-kick position is 90° and he has held it for weeks, so half of it is a felt target. **Folded into the existing every-stroke bullet rather than added as a ninth** — the main-swim note keeps its length.

**"Effortful... to conserve energy" answered honestly:** it costs now because it is manual, and a settled roll is mostly falling side to side rather than a rep. **Also told him rolling narrows the body, so it pays for itself at the same speed** — same family as the v³ answer, and he already accepts that argument. **Do not let this become "rotate harder"** — that is the second time today a new concept has tried to promote itself to engine (kick first, then rotation).

**⭐ A CUE OF MINE WAS BEING OVER-APPLIED, AND IT WAS THE SOURCE OF THE EFFORT.**

> oh i've been avoiding turning my head bc you said to keep it level lol that would make it easier

> so i think ive been turning way harder - i think the 6-1-6 forces that since theres so few strokes and kicks

**The line that did it is on the notes page:** *"in freestyle you breathe by rolling the body, **not by turning the head**."* Correct as a diagnosis of a head-turner, read literally as a prohibition — so he stopped turning his head at all and **rolled further to compensate.** That is the whole explanation for "getting the rotations down is effortful" one message earlier: he was trying to roll far enough that his face cleared on its own, which is over-rotation, and it is expensive.

**Fixed at the source, not just in chat** — the notes-page sentence now says the roll does most of the work and the head turns the small amount left over, with craning-while-flat named as the actual fault; a new bullet says outright that he does turn his head. The poolside sheet's breath bullet now says the turn is correct, names the marker (lower goggle wet, one eye in), and says never to roll further to free the face.

**His second message is a real observation about the drill and it is right: 6-1-6's roll is oversized.** With one stroke per six kicks the switch is a full 90°-to-90° commitment, which is what makes the drill work and also what he has been importing into open swimming. **Drills exaggerate on purpose; the timing transfers, the size does not.** Added one line to the 6-1-6 note saying exactly that. **He found this himself, one message after being given "half the drill position."**

**Pattern, second instance: a cue framed as a NEGATIVE gets over-applied.** First was "don't pull the leg forward," which he beat with his own "press like jumping off something." Now "not by turning the head." **Write cues as what to DO, with the fault named separately and specifically** — saved to memory ([[feedback_cues_as_do_not_dont]]).

**He found the mechanism behind "keep the lower goggle wet" by himself, minutes after being given it as a marker.**

> also ive noticed if eye and head are in the water it tends to pop the chin and jaw up? so it makes breathing easier?

**Correct, and it is the same fact as the goggle cue seen from the inside.** The low eye and the mouth sit on opposite sides of the turning axis, so holding the eye down is what carries the mouth up; on top of that, a head that stays low stays in the bow-wave trough, where the surface is *below* flat and the air is already waiting. **Third time his own phrasing beats the written cue** (after "jumping off something" and the drill-roll-size observation), so the marker on the sheet was swapped for his version — *keep the lower eye in and it pops your chin and jaw clear* — a "do" with a payoff instead of a checkbox. See [[feedback_cues_as_do_not_dont]].

**Nothing added to the sheet except one bullet legitimizing the reset** — he is already doing it, and the risk was that he reads it as cheating and stops. The bullet says to use it and to notice which of the two reasons it was. **No new drill, no new block. He said "still need practice," so the sheet repeats unchanged.**

#### 2026-10-03 — the kick stays alive because he holds it there, through the full swim

> kick stays alive bc i'm forcing it to, and for the full swim too (40 lengths) - i'm focusing on the twist as the central movement and it feels like i'm moving muscles i dont really ever use lol; very different

- **Answer to the switch question: the kick stays alive, held by attention.** It is not default yet, which is the same state as 2026-09-22 (*"forcing me to think about roll and leg kick"*), with a longer run behind it: this time it carried through 40 lengths of open swimming, not just the drill lengths.
- **First report where the twist is what he is attending to**, rather than the kick or the breath. *"Muscles I don't really ever use... very different."* He did not say where. **Hold the reading loosely:** it could be the roll finally coming from the middle (see the 2026-09-22 "mostly using arms" disclosure), but his words do not say that, so it is a question, not a finding. Asked where he feels it: ribs/sides, hips, or low back. **Low back is the one to hear about** (the W9 QL spasm is on file).
- **The right-side tell was asked and not answered.** He reported deliberate focus on the twist, which is the supervised state, not the *rolled without deciding to* state. Still open, still just ask.
- **Sheet unchanged.** No stroke count reported and none asked for. The notes page already says to roll from the hips; nothing to add.

#### Follow-up 2026-10-04 — hips and the front of the hips are sore, low back is not; the right is better but not natural

> definitely hips, it's the next day and hips are sore; also the part in front of hips. no feeling in lower back
>
> breathing on right definitely getting better but still not natural

- **Where the twist lives: hips, next-day sore, plus the front of the hips. No low back.** The low-back question is closed in the good direction. Next-day soreness after a session he described as using muscles he doesn't use is new work, not a flag.
- **The front of the hips is the one place to keep an eye on**, because the old burn there (2026-09-15 to 2026-09-18) was him pulling the leg forward on the upbeat, and he is now holding the kick in by force. The sheet already carries the fix (*the up half is free*). **Not asked a follow-up:** if it burns DURING a swim, check that cue first; if it is only sore the next day, it is just soreness. Do not turn this into a thread unless he raises it.
- **Right-side breathing: better, not natural.** That answers the tell question in the negative, and honestly: he has not yet rolled on the right without deciding to. It is moving, and the manual phase is still the phase. No count, no new drill.

#### 2026-10-06 — the three checks, answered, and he found a different way to kick

> shoulder was fine; hip didn’t burn tried something else and just turning hips to turn the legs?? is that right? using the legs themselves less to kick; trying to make front not engage for kicks now abs area is being felt more; the rolls are fully in hips didn’t even think about shoulders; after 20’lengths i’m breathing heavily lol not so much tired tho; don’t feel the hips or waist much tbh so maybe i’m doing that wrong? even trying to swim fast on last few laps i don’t feel hips so much it’s mostly cardio running out right now; right side breathing feels better and actually left side breathing feeling more like right side breathing, which means worse than before but i feel it’s more consistent on both sides now haha

- **Right shoulder fine.** Watchpoint clean.
- **Check 2 answered: the roll starts in the hips, "didn't even think about shoulders."** Compare 2026-09-22, *"I've been mostly using arms."* The arm-led roll is gone, reported from the inside. **Still the supervised state** (he was attending to the twist), so the test stands: does it survive when he stops thinking about it.
- **Check 1 is NOT a clean answer.** "Hip didn't burn" came after *"tried something else"* — he changed the kick mid-session, so the no-burn belongs to the new kick, not to the sheet's press-off-the-foot kick. Do not read it as the "up half is free" cue proven.
- **Check 3 answered: breathing hard, not tired, hips and waist not felt, and on the fast laps it was "mostly cardio running out."** Not a fault. The 10-04 hip soreness was new work; a pattern that is now being used continuously does not announce itself at easy pace, and soreness was already named a broken gauge for swimming (2026-09-08). Fast laps running out of air is the v³ answer from 2026-09-18, not a new finding.
- **The new kick, his words: *"just turning hips to turn the legs."* Asked if it is right. Answered: yes in direction, it is the rhythm block's own aim** (the kick comes off the roll, one hip motion instead of two programs) **with one caveat — the legs do not go to zero.** Rotation alone swings the legs sideways; with no small flick left in them they can wag side to side. The legs stay loose and trailing, small boil at the surface, rather than switched off.
- **"Trying to make the front not engage" is a prohibition, and he drives prohibitions to zero** ([[feedback_cues_as_do_not_dont]]). The DO version is the one he already said: turn the hips, let the legs swing off the turn. Given it that way, anchored to walking (the pelvis turns and the legs swing off it).
- **Abs are felt more now: expected** — the trunk twist is done by the sides of the abs. What would not be expected is the low belly gripping (pelvis tucking under), which is why it was asked where it sits.
- **⭐ Left-side breathing now feels like the right: read as the two sides converging, not the left getting worse.** The left was the comfortable side because it was the side that let a head-turn paper over a flat body (the 2026-09-02 tell). With the roll in the hips the left no longer has the shortcut, so it costs what the right costs. *"More consistent on both sides"* is his own conclusion and the right one. **One session; held as a read.**
- **Right side: better, not yet automatic.** Same state as 10-04.
- **Sheet unchanged.** One report, and he changed the method himself mid-session. The sheet's kick cue (press off the bottom of the foot) may now compete with "hips turn the legs", so that was asked rather than rewritten. If it repeats, his words go on the sheet.
- **Stroke count not collected, not chased.**

#### Follow-up same day

> feeling low in the belly above hips; no low back feeling right now; yes still pressing off the bottom of my foot! maybe i’m not kicking hard enough any more? trying to be quieter; hip turn is turning legs yes but also kind of replacing deliberate kicking, but i probably shouldn’t do that? yeah i had to think about hip roll every length

- **Abs: low belly, just above the hips. No low back.** Could be the lower abs, could be the top of the deep hip flexor, which runs through that area. Not separable from a description and not a flag while the low back is quiet. **Watch only:** if that spot gets sore or starts tugging at the low back, ask whether the pelvis is curling under. The DO cue if it comes up: stay long through the front, like standing tall.
- **Foot press is still there, so the two cues are not competing.** The hip turn sets the timing and the foot press is the small push that rides on it. Nothing to rewrite.
- **"Not kicking hard enough?" Answered: quieter is the goal. The test for enough is the legs staying up and you still moving forward.** If the legs sink, lean on the chest first (the standing rule), before kicking harder.
- **Hip turn replacing deliberate kicking: answered as fine.** A kick that rides the roll is SUPPOSED to stop feeling like a separate deliberate thing. What would be wrong is legs gone fully limp: sinking, or wagging side to side.
- **Had to think about the hip roll every length.** Still the manual phase. Same state.
- **"What do you mean by changing method mid swim?"** I had read "tried something else" as a switch partway through, which made check 1 unclean. **He asked; it may have been a misread on my part.** Asked whether he did the whole session with the hip-turn kick. If he did, check 1 stands as a clean no-burn on the hip-turn kick.

#### Second follow-up — the whole swim was the hip-turn kick, and he had the burn check backwards

> oh the entire swim i'd been using the rotation more to turn the legs, but i have no idea if that's right; i haven't really felt the hip burn so i think i'm kicking wrong; yeah i'm using hip turn kick to turn the body; i'm not sure on the wall - so if i'm on the wall i'm supposed to rotate the hips and that drives the kick? this is the first time i've tried it (otherwise previousy its more like kicking something like closing a door with foot); legs are staying up tho and not sinking, and even when trying to swim fast i'm trying to rotate way faster to drive the kick rather than trying to kick faster (and rotating to drive arms too, which all this is really exhausting as a motion esp when going fast)
>
> yeah i think its lower abs i feel i'm using more but its not sore after swimming; its not tugging lower back tho it just feels more active while swimming

- **Not mid-swim: the whole session was the hip-turn kick. My "changed method" read was wrong.** Check 1 is a clean no-burn on the new kick.
- **⭐ He read "no hip burn" as kicking WRONG. It is the opposite.** The front-of-hip burn was the fault (hauling the leg forward on the upbeat, 2026-09-15 to 09-18); the check existed to catch it. **The check was written as a question with no stated good answer, so he filled in the wrong one.** Next time a check goes on the sheet or in chat, say which answer is the good one.
- **The wall kick has no roll in it, so the hip-turn kick does not apply there.** The two senses of "hip" again (log 2026-09-10: pelvis vs joint). At the wall the body is flat: the kick is the leg swinging from the hip JOINT, and the press off the bottom of the foot. In the swim the PELVIS turns and that kick rides the turn. Wall stays as written.
- **Legs stay up, not sinking.** The quiet kick passes its own test.
- **⭐ Fast laps: "rotate way faster to drive the kick... and to drive arms too... really exhausting."** That is the roll promoted to engine, the third time a concept has tried that (kick 09-22, rotation 09-22, now rotation again). **The roll sets the timing; it is not the motor.** Answered: on a faster length keep the roll the same size and pace and let the arms pull harder. The 09-18 timed pair showed the pull grips, so the arms are where speed comes from. And the fast length is still the bad deal (v³); the chill swim is the one to own.
- **Lower abs: active while swimming, not sore after, no low back. Read as the abs holding the pelvis steady while it turns.** Closed unless it gets sore or reaches the low back.

#### 2026-10-08 — chill swim the day after legs: the drill timing is good, the open item is the tired stretch

> did it! still had to decide it but felt better; swam super "chill" today and still felt quick; 6-1-6 timing is pretty good now i just need to make it more natural in the long swim, esp when getting tired; dont have burn anywhere but also prob bc i was at the speed of a lazy stroll lol; *somewhere* has to burn when you sprint though?
>
> yeah holy cow doing it after leg day was rough (hence swimming like a stroll)

- **Roll still decided, but better.** *"Still had to decide it but felt better."* Same supervised state as 10-03, 10-04 and 10-06, direction still improving. The unprompted tell (catching that he rolled on the right without deciding to) has not shown up.
- **6-1-6 switch: "timing is pretty good now."** First time the drill itself is reported as landing rather than costing attention (09-22: *"still need practice"*). The gap he named is carrying it into the long swim **when tired**. The open item narrows from "does the kick stay alive through the roll" to "does it stay when he is tired."
- **Chill pace "still felt quick."** No stroke count given, so no claim either way. The count is the only way to know whether felt-quick means fewer strokes.
- **Check 1 (front-of-hip burn): no burn anywhere. The good answer.** His own caveat: lazy-stroll pace, so a weak pass. One more point: the legs were already worked from the day before and still nothing burned while kicking, which is mild support that the kick is small. Held as a read.
- **His question: "somewhere has to burn when you sprint?"** Answered: yes. Breath runs out first (09-18, 10-06). Then the expected muscle burn is in the pull: lats, back of the shoulders, back of the upper arm, since the arms are the engine (09-18 timed pair). Front of thigh or front of hip would be the fault versions (kick from the knee; leg hauled forward). Not an invitation to sprint; the brief stays technique-only and the chill swim is the one to own.
- **Swim the day after legs: *"holy cow... rough."*** Swam like a stroll because of it. One instance. The reverse direction of the Sunday-swim/Monday-push question. Observation only, no schedule change.
- **Sheet unchanged.**

#### Follow-up same day — what slips when tired is the kick on the roll, and refocusing keeps it

> oh no should i be counting strokes lol, idk probably more strokes since it takes longer to get to the other side?
>
> so a lazy swim and a fast swim would otherwise both take the same number of strokes? even tho legs felt rough i dont think any of the legs muscles really felt anything in the swim; i dont think they use any of the same muscles at all?
>
> the thing that slips is the kick on the roll, but if i focus on rolling and kicking thru the roll then it remains

- **Stroke count: not taken, and he asked if he should.** Answered: optional, two lengths (early and last), a clue and not a grade. His guess (more strokes because the length takes longer) mixes time with distance per stroke; corrected with the 09-18 pair (19 in 60 s chill vs 17 in 53 s faster, same stroke rate). Not a finding about today.
- **Legs from leg day felt nothing during the swim.** Answered: same muscles, very different load; a small quiet kick is a fraction of a squat. Fits the quiet kick and the no-burn. Held as a read.
- **⭐ Open item answered: when he tires, the kick on the roll slips, and focusing on rolling and kicking through the roll keeps it.** Lengths-in, said a message later: *"probably 30 lengths in"*, on a leg-day-tired swim, so not a clean baseline. Still held by attention, the same shape as 10-03 (*"kick stays alive bc i'm forcing it to"*). The sheet's *"let the kick land ON the roll"* already says this, so no change. If a refocus stops working partway through the long swim, the sheet's own rule applies: stop, do not push on.

## Backlog — not yet, in rough order

1. **Rotation must become automatic first.** Everything below waits on it.
2. **Catch / high elbow** — `swim-catch-up-drill`, `swim-fingertip-drag`, `swim-fist-drill`, `swim-sculling` all already exist in the library. This is where the lifting strength finally becomes useful rather than a crutch. **Confirmed 2026-09-18 as a source of upside, NOT a leak** — the timed pair showed the catch already grips. Do not promote it on the theory that something is broken.
3. **Kick cadence / 2-beat rhythm tied to the roll** — he flagged "leg cadence" in the original brief and it still hasn't been addressed on its own terms, only via rotation. **OPENED W29D2, ahead of catch — the legs, not the pull, are the limiter now.** **BUILT 2026-09-18 — `swim-rhythm-block`, in the full session, see the session note above.** Held behind "not until a small kick is easy"; the small kick became easy and self-correcting the same day, and his own pat-head/rub-tummy report made the case. **Now the live block — the open item is whether it lands, not whether to start it.**
4. **Bilateral breathing rhythm — ANSWERED 2026-09-22: every-3, alternating sides.** *"i breathe left, stroke three times then breathe right."* **Nothing to do with it** — it is the correct pattern, it is already automatic, and it was never the lever. Item closed; do not re-open it as a project.

## Open questions

- **Does the kick actually stay alive through the roll?** OPENED 2026-09-18, the whole point of the rhythm block. The tell is on the 6-1-6 switch: if the kick goes quiet exactly when he rolls, the two programs are still separate. **Ask specifically about the switch, not about the drill overall.** **PARTIAL 2026-09-22:** *"switch felt good... forcing me to think about roll and leg kick - still need practice tho."* He did not report the kick dying, but he did not report it staying alive either, and the switch still costs him attention — which is the honest state after one session. **Not closed. Keep asking about the switch specifically, and keep the block as-is until he stops having to think about it.** **2026-10-03:** *"kick stays alive bc i'm forcing it to, and for the full swim too (40 lengths)."* Alive, and now through open swimming, but still held by attention. Same open item: it closes when he stops having to force it. **2026-10-08:** *"6-1-6 timing is pretty good now i just need to make it more natural in the long swim, esp when getting tired."* The drill switch has landed; what is left is the long swim while tired. Ask what slips first when he tires. **ANSWERED same day:** the kick on the roll slips (about 30 lengths in); refocusing on rolling and kicking through the roll keeps it. Still attention-held; closes when it no longer needs the refocus.

- **Which muscles is the twist actually working? — ANSWERED 2026-10-06 (see entry): roll starts in the hips, hips/waist not felt, abs felt more, no front-of-hip burn (confounded by a method change), tired = cardio.** Abs sub-item closed same day: lower abs, active while swimming, not sore, no low back. Original framing — OPENED 2026-10-04, diagnose at the next swim (his call: "lets diagnose that next time i swim").** Next-day soreness was hips plus the front of the hips, no low back, and he cannot tell which muscle is which from soreness alone. **Three plain checks, reported afterwards, no new drill:** (1) at the wall kick, does the front of the hip burn while kicking; (2) at the 6-1-6 switch, does the roll start low in the hips or high in the shoulders; (3) after ~20 lengths of the main swim, where is the tired: side/back of the hips, front of the hips, or the waist. **Front-of-hip burn while swimming points back at the "up half is free" cue; side/back is the expected work.** Do not call it a finding from soreness alone.
- **Why does he drop into the side position mid-swim? — ANSWERED SAME DAY 2026-09-22, and neither offered option was right.** He forces himself into it to stop himself skipping the roll on the right. Not air, not recovery — a deliberate self-correction. **Right side only; the left is "super easy and feels like rest."** See the follow-up above; the open item this replaces it with is below.
- **Does the right-side roll become default, or does it stay supervised?** OPENED 2026-09-22. The capacity is there — *"if i get in it it feels good"* — so the question is only whether it stops needing a decision. **The tell to ask for: has he caught himself rolling on the right without deciding to?** Do NOT turn this into a count or a drill of its own; the rhythm block is already the mechanism. Ask, and wait. **2026-10-03:** asked; he answered about the kick and the twist, not the tell. He reports deliberate focus on the twist, so it is still supervised. **2026-10-04:** *"breathing on right definitely getting better but still not natural."* Better, still supervised. Keep waiting for the unprompted version. **2026-10-06:** better again, and the roll now starts in the hips, but he was still attending to it. Same state. **2026-10-08:** *"still had to decide it but felt better."* Same state, direction still improving.
- **Wall turn or breathing roll? — ANSWERED 2026-09-21: the breathing roll.** *"i'm not turning at the wall lol i'm jsut doing the lazy kind"* — open turns only, so there is no wall turn for the kick to die in. The kick going quiet is on the roll, which is exactly what the 6-1-6 switch isolates.

- **Does a Sunday swim cost him Monday's push day?** OPEN, deliberately kept small. One instance (swim Sun 2026-09-06 → push Mon 2026-09-07) and it was confounded by ~3h of sleep and a reordered session; the early lifts were the day's best, which leans against. **Made less likely still by intensity:** he swims at drill pace and never pushes, so the input is small by design. **Just watch for a repeat** — **2026-10-08: Tue 10-06 swim, Wed 10-07 legs, and the squat was the best 80s of the program by his word; the one possible cost was the cold RDL hands on set 1, confounded by the missing warmup set.** One more instance that leans against. The reverse direction (legs Wed, swim Thu) was the rough one. If push days after a swim keep reading heavy while push days without one don't, that's the signal. Don't run an experiment for it and don't re-litigate the single case.
- **Stroke count baseline** — ANSWERED W29D2: **~18-20 per length, full stroke.** The drill-mode count (8-9, kicking through each breath pause) is not comparable and not the number.
- **Where the kick tires** — ANSWERED W29D2: thighs + hip flexors, in both drill and full stroke, and mostly breathlessness rather than muscle. Mapping: front of thighs = kicking from the knee; hip flexors = kick too big; calves or feet cramping = forcing the point.
- **Does a tiny kick calm the breathing?** **ANSWERED 2026-09-15 — yes, kick size was it.** With the kick shrunk, the breathlessness at a slow pace was gone and what remained was local hip-flexor fatigue, not air. **Breathing pattern stays untouched** — it is no longer needed as the next lever. **Sub-question: hip-flexor burn on a tiny kick — ANSWERED 2026-09-18, and resolved.** It was him pulling the leg forward on the upbeat. With the down-half framed as a push off the bottom of the foot and the up-half left free, the burn was gone. **On the sheet as of 2026-09-18, in his words.**
- **Does the pull actually add anything, or is the catch slipping?** **ANSWERED AND CLOSED 2026-09-18 — the pull works, the catch is not slipping.** He timed it the same day: 17 strokes / 53s vs 19 / 60s for two lengths. **Stroke rate identical (0.64 vs 0.63 per sec), so all the speed came from distance per stroke, none from cadence** — which is the signature of a catch that grips, not one that slips. **The catch block does NOT move up.** Side finding: 13% faster costs ~40-45% more work (v³), so the chill swim is the efficient one and the fast number is not worth chasing.
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
