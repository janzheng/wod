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

## Backlog — not yet, in rough order

1. **Rotation must become automatic first.** Everything below waits on it.
2. **Catch / high elbow** — `swim-catch-up-drill`, `swim-fingertip-drag`, `swim-fist-drill`, `swim-sculling` all already exist in the library. This is where the lifting strength finally becomes useful rather than a crutch. **Confirmed 2026-09-18 as a source of upside, NOT a leak** — the timed pair showed the catch already grips. Do not promote it on the theory that something is broken.
3. **Kick cadence / 2-beat rhythm tied to the roll** — he flagged "leg cadence" in the original brief and it still hasn't been addressed on its own terms, only via rotation. **OPENED W29D2, ahead of catch — the legs, not the pull, are the limiter now.** **BUILT 2026-09-18 — `swim-rhythm-block`, in the full session, see the session note above.** Held behind "not until a small kick is easy"; the small kick became easy and self-correcting the same day, and his own pat-head/rub-tummy report made the case. **Now the live block — the open item is whether it lands, not whether to start it.**
4. **Bilateral breathing rhythm** — confirm whether he's actually on every-3 or something else; worth pinning down once rotation settles, since the count is what makes it automatic.

## Open questions

- **Does the kick actually stay alive through the roll?** OPENED 2026-09-18, the whole point of the rhythm block. The tell is on the 6-1-6 switch: if the kick goes quiet exactly when he rolls, the two programs are still separate. **Ask specifically about the switch, not about the drill overall.**
- **Wall turn or breathing roll?** His *"during turning my kick slows or stops"* was read as the breathing roll and never disambiguated. Cheap to close next report.

- **Does a Sunday swim cost him Monday's push day?** OPEN, deliberately kept small. One instance (swim Sun 2026-09-06 → push Mon 2026-09-07) and it was confounded by ~3h of sleep and a reordered session; the early lifts were the day's best, which leans against. **Made less likely still by intensity:** he swims at drill pace and never pushes, so the input is small by design. **Just watch for a repeat** — if push days after a swim keep reading heavy while push days without one don't, that's the signal. Don't run an experiment for it and don't re-litigate the single case.
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
