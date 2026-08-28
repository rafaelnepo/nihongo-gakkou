# Suno production findings — measured, not assumed

**This is the accumulating record. Every entry is either something a real
generation proved, or something explicitly marked UNTESTED.**
Append here rather than editing the song sheets, so a future session can tell
what has actually been observed from what merely sounded reasonable.

Status vocabulary: **VALIDATED** (a generation proved it) · **FAILED — DIAGNOSED**
(it broke, and the cause is known) · **UNTESTED** (proposed, never run).

---

## F-01 · Tempo 92 BPM is the floor and it is correct — VALIDATED
*2026-08-27, episode 1.*

Nepô: *"The tempo worked great, super easy to follow along."*

The plan's constraint was 85–100 BPM, on the argument that a learner who cannot
sing along on first listen has been given a song rather than a lesson. 92 held.
**Do not let a more musical take at a faster tempo win** — that trade is the whole
failure mode of this genre. Keep the slowest take that is still bearable.

## F-02 · The particle fix works, and it does not sound robotic — VALIDATED
*2026-08-27, episode 1.*

Writing the topic particle `は` as `ワ` (`こんにちは` → `こんにちワ`) produced the
correct *wa* reading with no audible weirdness. The mixed hiragana/katakana
mid-word did not degrade the singing.

**So the two-document rule is real and cheap.** The Suno score and the learner
sheet diverge on exactly this, and nothing else needed to change for episode 1 —
the song was already all-kana, so there was no ambiguous kanji, no digit and no
Latin string for the model to guess at. **Kana-only songs are unusually safe.**
Expect more divergence the moment a song carries kanji or numbers.

## F-03 · The small tsu survives — VALIDATED
*2026-08-27, episode 1.*

`いってきます` and `いってらっしゃい` came out with the `っ` intact — a real beat of
silence, *it-te* not *ite*. This was the main risk to the whole premise: a song
that swallows the sokuon actively teaches wrong mora-timing, which is worse than
teaching nothing.

The remedy that was held in reserve (`いっ てきます`, with a space to force the
break) **was not needed**. Keep it in reserve; do not apply it pre-emptively.

## F-04 · One-line voice alternation does not work — FAILED, DIAGNOSED
*2026-08-27, episode 1. The one thing that broke.*

Episode 1 was written A/B/A/B, changing voice **every single line**, on the
pedagogical argument that a call must be immediately followed by its response.
The generation kept one voice throughout.

**Cause: the switch was requested at a finer granularity than Suno resolves.**
Practitioner consensus (see Sources) is that a part change has to sit in a block
of **about two lines**; finer than that and the model either holds one voice or
degrades the result into 朗読劇 — a reading play rather than a song.

Three responses, in order of preference:

1. **Double every line** so each voice holds two before handing over
   (`suno-v2.txt`). This is *not* a compromise — doubling the line doubles the
   repetition, which is the method. The constraint improved the song.
2. **Change texture instead of timbre.** Make the response a *group* answering a
   lead, doo-wop style. Backing vocals are an arrangement texture rather than a
   second soloist, so Suno handles them reliably — and a group answering the lead
   is arguably better pedagogy, since the learner joins the group rather than
   watching two other people talk. Style prompt B in `01-aisatsu/style.txt`.
3. **Reinforce the duet in the style prompt as well as the lyrics** — name it
   twice, and declare it at the top of the lyrics box. Style prompt A2.

**Do not assume this is a free-tier limitation.** Nothing observed points at
tiering; the observed failure is fully explained by granularity. Paid *Personas*
would give a further lever (lock a voice per role) but should not be bought to
solve this specific symptom until (1) and (2) have been tried.

## F-07 · Suno models a duet as an ARRANGEMENT, not as a conversation — PARTIAL
*2026-08-27, episode 1 v2. The doubling worked; the dialogue did not.*

The v2 doubling did produce two voices. But Suno **ignored the per-block tags**
and imposed its own duet grammar instead: male part, then female part, then
**both voices in unison on the last line of each verse**. Nepô: *"Came out quite
nice actually, but it didn't feel like a conversation."*

**The model has a learned idea of what a duet does** — trade sections, converge
for the payoff — and it applies that shape over your role assignments. Tagging
lines A/B does not make a dialogue; it makes a section trade.

Two consequences, and the second one is the useful one:

1. **A true conversational exchange probably needs a different mechanism.**
   Either the doo-wop texture route (F-04 fix 2 — lead vs. answering group), or
   two separate generations layered in a DAW, or paid Personas. One generation
   asked to hold a dialogue is fighting the model's prior.
2. **The unison-on-the-last-line bias is a GIFT for a learn-along song.** Unison
   is exactly where a listener is invited to join in. So: put the phrase you most
   want them to sing on the **last line of each verse**, and let Suno's own habit
   do the recruiting. Stop treating it as a defect and compose for it.

**This is now a design rule, not a workaround.** Where a song has a phrase that
should be sung by everyone — a kana row, a counted list, a refrain — it belongs
last in its verse. See `02-gojuon/`, which is built on this from the start.

## F-08 · Suno drops and repeats lines — and the F-04 fix made it worse — CONFIRMED
*2026-08-27, episode 1 v2. Found by Nepô listening, not by any check.*

Observed: `よるの あいさつ` was sung **twice**, and `ひるの あいさつ` never appeared.
A line was dropped and its neighbour filled the hole.

**This is not random, and the v2 doubling is implicated.** The doubling fix for
F-04 tells the model that *adjacent identical lines are normal in this song*. It
then has no way to distinguish its own repeat-errors from the design. The fix for
one defect built the habitat for another.

**And look at which line it ate.** v2 put these two in one block:

    ひるの あいさつ
    よるの あいさつ

They differ by **one mora**. Two near-identical adjacent lines are exactly what a
generative model collapses into one. The pairing was mine, and it was wrong.

Three rules, all of which come out of this one observation:

1. **Never put two lines that differ by a single word or mora adjacent to each
   other.** Separate them with a contrasting line, or put them in different
   sections. Textual distance is what resists collapse.
2. **Sort content by whether losing it leaves a hole.** An identical refrain can
   be repeated or dropped harmlessly. A line carrying unique meaning cannot.
   Put the fragile material where the song is least dense, and never double it
   for the F-04 fix — double the refrain instead.
3. ~~Long enumerations should be generated in halves and joined.~~
   **RETRACTED 2026-08-27 — see F-09.** This was wrong, and it was wrong for a
   reason I should have seen before recommending it.

**There is no automated check for this.** The only detector is reading the lyric
sheet while the track plays. Do it once per generation, on the first listen,
before deciding whether you like the take — a dropped line is easy to miss when
you are listening for whether the music is good.

Fix for episode 1 is `01-aisatsu/suno-v3.txt`.

## F-09 · Two generations are two songs. Splitting and merging does not work — FAILED
*2026-08-27, episode 2. This was my recommendation and it was wrong.*

F-08 rule 3 said to generate a long enumeration in halves and join them. Nepo
tried it on 五十音: *"It came out too different."*

**The error was conceptual, not tactical.** I treated "generate in halves" as a
*prompting* strategy when it is an *audio continuity* problem. Two Suno
generations from the same prompt share **no seed, no voice, no tempo, no
arrangement** — they are two different songs that happen to have consecutive
lyrics. There is nothing to merge. This should have been obvious and I did not
think it through before writing it down.

**And there is a second error underneath the first.** I never confirmed that the
full 42-line song actually *fails* in one pass. F-08 established that Suno drops
lines; I assumed a long song would drop more, then engineered a fix for a problem
that had never been observed. **Do not build a workaround for an untested
assumption.**

### What to do instead, in order

1. **Just run it in one pass.** Untested and probably fine. Read the lyric sheet
   while it plays and check for drops. This is the cheapest possible experiment
   and it should have been step one.
2. **If it genuinely is too long, use Suno's own Extend** — not a second
   generation. Extend conditions on the audio that already exists and
   **Get Whole Song** stitches the result to the retained source, so voice and
   arrangement carry forward. Drift is still possible, but it is *continuation*
   drift rather than a different song. Set the retain point deliberately and
   listen through the join from before the seam.
3. **Shorten the song structurally.** For 五十音 the only removable material is
   the kana refrain that *this project added*, not Hakushu's. Dropping one of the
   two runs per stanza takes it from 42 lines to about 30 — but see the tension
   below, because the two candidate cuts are not equivalent.
4. **Ship two deliberate parts and stop pretending it is one track.** ア行–ナ行 and
   ハ行–ワ行 as Lesson 1 and Lesson 2. For a drill series that is legitimate
   structure, not a defect. Own the seam instead of hiding it.

### The tension in option 3, which is a real editorial choice

The arrangement is `twister1 / kana / twister2 / kana`. Cutting one run means:

- **Cut the closing run** → `twister1 / kana / twister2`. Keeps Hakushu's original
  line order exactly. **But the verse no longer ends on the kana**, which throws
  away the F-07 unison-recruitment the whole arrangement was built on.
- **Cut the mid-stanza run** → `twister1 / twister2 / kana`. Keeps the unison
  payoff. **But it moves the kana from Hakushu's position to the verse end**,
  which is the one thing the arrangement promised not to do.

No default taken. Faithfulness and effectiveness genuinely point opposite ways
here, and it is Nepo's call which one the series owes more to.

## F-05 · Long vowels — UNTESTED
The `おはようございます` risk (the `う` articulated as its own syllable rather than
lengthening the `o`) did not come up as a problem, but was not specifically
listened for either. If it appears: change to `おはよーございます` **in the Suno
score only**. Same for `ありがとー` / `おめでとー`.

## F-06 · Spoken intro and outro — UNTESTED
Suno will most likely *sing* the `[Intro]` and `[Outro]` rather than speak them.
This matters more than it looks: the spoken tag is the **pitch-accent mitigation**
— the one moment in the song where a phrase carries a correct contour instead of
a melody. If Suno sings it, record those four seconds separately and edit them on.

## F-10 · A LIST of same-onset words BLENDS — put words in sentences instead — CONFIRMED
*2026-08-27, 01-aiueo v1. Found by Nepô listening.*

Nepô: *"it's hard to know when it's changing words. あ あさ あめ あお the
pronunciation is too close together and it kind of blends together."*

A rapid list of words that all **start with the same mora** (あさ・あめ・あお) has no
audible boundaries — the ear can't tell where one word ends and the next begins.
This is fatal for a vocabulary song: the learner can't segment the very words
being taught.

**The fix is also the better pedagogy: put each word in a short SENTENCE.** A word
surrounded by different context is naturally separated from its neighbours, AND a
word shown *in use* teaches production, not just recognition — which a bare list
never does. Nepô, 2026-08-27: *"just learning the words without any context
doesn't add too much… I would like to see practice in context from the beginning."*

So the rule for the learning series flipped: **context from song 1, not later.**
Structure each target word as **word → short sentence using it**, and let words
**recombine** across the song (いく taught with いえ, then reused in うみ へ いく,
えき へ いく). Interleaving the isolated words with sentences also keeps two
same-onset words from ever being adjacent — the F-08 collapse guard, for free.

**Format/duration also learned here (Nepô):** the 1-minute words-only cut is a
good **vertical Stories/Reels** short; the **YouTube** version wants ~3 minutes,
and the way to fill it *without repeating a section* is the contextual sentences,
not a loop. See `house-style.md` (duration standard) and `01-aiueo/` v2.

## F-11 · Series-voice audition on 01-aiueo v2 — VALIDATED (in progress)
*2026-08-27. Auditioning the house voice — see `house-style.md` "Defining the
main voice." One variable per take (the controlled-variation test).*

Sliders per the `01-aiueo/style.txt` recipe (weirdness ~20%, Vocal Gender set
explicitly, style influence ~50–60%). **Confirm the exact per-take numbers when
picking the winner** — this log has the combos, not yet the precise slider values.

- **Style D · koto × modern beat + MALE voice** → Nepô: *"came out great."*
- **Style B · city pop + FEMALE voice** → Nepô: *"also great."*
- **Style A · lo-fi hip hop** → good, but not the winner here. Nepô: *"lo-fi will
  be good for other things, but not for these basic ones."*

**CONCLUSION (Nepô, 2026-08-27):** **city pop + female voice is the house sound
for the BASIC learning songs** — *"the city pop actually sounded better
overall."* **koto × modern (male)** and **lo-fi** are kept for OTHER content
(moodier / more advanced), which fits `house-style.md`'s "one voice, many
arrangements" as *one house voice per track*, not one for everything. Next:
make the **Persona from the city-pop-female take** (clean single-voice seed) and
record its exact sliders here.

## F-12 · Suno performs pasted lyrics ONCE through — length is PREDICTABLE — VALIDATED
*2026-08-27, 01-aiueo v2. Nepô: "Suno is very literal when we paste in the
lyrics. It goes through it one time and ends the song."*

Custom lyrics are **not** padded or looped — Suno performs them once and stops.
The full v2 lyric (~15 word→sentence pairs, ~40 lines) came out **~1:50**.

**Consequence (a lever, not a limit):** we can **target a length by controlling
lyric quantity** — extrapolate from ~15 pairs ≈ 1:50 (~8 pairs/min at this
teaching pace). So the **1-min vertical cut** ≈ half the pairs; a **2-min**
single-row song is about the natural size of one row's content (Nepô: *"2 minutes
seems to be the sweet spot for these single"*); a **3-min** version needs ~50%
MORE lyric.

**How to reach 3:00 — add VARIED content, don't just duplicate.** Duplicating the
exact lyric is the crudest fill and risks Suno collapsing the identical repeat
(F-08), and it reads as a loop. Better: a **"day" bridge** that recombines all
the words into the little narrative (the RPG-rich payoff), and/or a **second pass
of the SENTENCES ONLY** (drop the isolated word calls — the learner already has
them), which varies round 2 from round 1 and consolidates in context. See
`01-aiueo/` for the 3-min test structure.

## F-13 · Cross-song recombination works — an earlier row scaffolds a later one — VALIDATED
*2026-08-28, か行 animals (02-kakikukeko-doubutsu), on first listen after 01-aiueo.*

Nepô: *"I can clearly see how the first song helps identifying words in the doubutsu
song. The i+1 is working beautifully as a ladder to learning."*

The row-1 vocabulary deliberately recombined into the か-row sentences (いる, みる,
さんぽ, うみ) carried its meaning across, so the only new load in each animals sentence
was the **target word + its illustration**. The learner felt the second song as
comprehensible *because of* the first — i + 1 confirmed **across songs**, not just
within one. The ladder, not a single rung.

**This upgrades a design assumption to an observation.** F-10 proved
context-*within* a song teaches; this proves continuity *across* songs — a word met
in song N returns as known scaffolding in song N+1, and the learner notices.

**Design consequence, now a rule:** keep deliberately recombining prior-row words into
every new row, and (within a row) across its themed variations. The series
**compounds** — each song is easier because the ones before it were sung. When
building the slate, seed later targets' sentences with earlier words on purpose.

## F-14 · The KIDS voice works — a lead + children's chorus, playful arrangement — VALIDATED
*2026-08-28, animals cut, first kids-style take (the P3 persona, `personas.md`).*

Nepô: *"It came out great!! My son is going to love this version!"*

The kids style (bright youthful female lead **+ a children's chorus answering**, toy-box
instrumentation — glockenspiel/marimba/toy piano/ukulele/claps — ~104 BPM,
call-and-response) generated clean and joyful. This is the **recognition test**
(`house-style.md`) passed for a new voice, and it re-confirms **F-04/F-07**: a chorus is
an *arrangement* texture, not a second soloist, so Suno handles a lead + answering group
reliably — and the row refrain lands as a real kids-chorus unison, exactly the
sing-along recruit. Kid energy did not wreck enunciation.

**Consequences.**
1. **P3 is a keeper** — the third house voice (after P1 female city-pop, P2 male koto).
2. **Promote it from a per-song style to a reusable Persona.** But the shipped songs'
   chorus/call-and-response makes a **poor Persona source** (house-style.md ⚠:
   duets/choirs are hard to reuse). So build a deliberately **single-voice seed** that
   carries only the voice; the chorus + call-and-response are added back **per episode**
   as arrangement. The seed spec is in `personas.md` → "The seed plan".
3. The animals cut is P3's natural home (かに/えび = the Ebi-Kani-kus creatures); it's
   also the one a small child will replay — the affective-filter payoff, measured.

---

## Sources

- [Suno 日本語歌詞のコツ — KaraGo](https://note.com/karago_jp/n/n701e2ceb7358)
  — kanji→katakana, particles, numbers, the hybrid rule.
- [Suno 日本語歌詞が変になる5つの原因 — AI日本語ラボ](https://web-wing.com/ai-labo/suno/guide)
  — the five failure modes and their fixes.
- [Sunoでデュエット曲を作る方法｜男女の歌い分けは「2行交代」が現状の最適解 — じょーくんStudio](https://jokun-studio.com/suno-duet/)
  — the two-line rule, and why finer splitting produces 朗読劇.
- [The Duet Breakthrough — Kordra](https://kordra.io/journal/duet-breakthrough-how-we-fixed-vocal-bleeding)
  — genre-driven gender defaults override vocal tags; structural splitting to
  reset the singer cache.
