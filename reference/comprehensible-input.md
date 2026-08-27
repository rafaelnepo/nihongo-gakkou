# Comprehensible Input — core principles, applied to our songs

Stephen Krashen's Second Language Acquisition theory holds that language is
absorbed **subconsciously, through exposure to meaningful communication** — not
through explicit grammar instruction. This project takes that seriously: every
song is an attempt to deliver **comprehensible input a learner enjoys**.

This file states the theory (Krashen's five hypotheses + his classroom
applications) and, for each part, **what it means for how we make songs and
videos** — keeping only what makes sense for a song, and being honest where a
song is a poor fit for a principle.

The one-line version already lives in `../README.md` (the learning-strand guiding
principle) and in `../findings.md` F-10. This is the foundation under both.

---

## The five hypotheses

### 1 · Acquisition vs. Learning
**Theory.** Two separate mental processes. *Acquisition* is subconscious,
implicit absorption — the same process as a child's first language — and it
drives natural, effortless fluency. *Learning* is conscious study of rules; it
yields knowledge *about* the language but does not by itself produce fluent
output.

**For our songs.** A song is an **acquisition** device, not a grammar lesson.
- The **video is acquisition**: Japanese only, the illustration carries the
  meaning, no translation and no rule-talk on screen (`screen.txt` has no romaji,
  no furigana, no gloss).
- The **sheet is optional *learning* support**: `learner.txt` (romaji + gloss)
  and the generated `sheet.html` are where a curious learner can consciously
  study — kept *off* the video on purpose.
- **Don't turn a song into an explicit lesson.** The premise of the whole project
  is that Japanese conjugation already rhymes, so the *pattern* is acquired by
  singing it, not by being told the rule.

### 2 · The Input Hypothesis (i + 1)
**Theory.** Acquisition happens when a learner understands messages **slightly
beyond** their current level (*i*). The extra step (*+1*) is made understandable
through **context, visuals, gesture, and background knowledge** — not dictionary
definitions.

**For our songs.** This is the core of our comprehensible-input principle, and it
is exactly why **F-10** ("words alone don't teach; put them in sentences") is true:
- The **target word is *i*; the sentence around it is the *+1***, made
  comprehensible by the **illustration + the audio + the little scene** — never by
  translation. A bare word list isn't comprehensible input; context is what makes
  it input at all.
- The **gojuon-by-words series is graded *i + 1***: each song sits just past the
  last (row by row, then combined "Quest" songs), so the step is always small and
  supported.
- **Rule:** deliver the +1 with a picture and a scene, not a gloss on screen.

### 3 · The Monitor Hypothesis
**Theory.** Consciously learned rules act only as an internal **editor** — a
"monitor" that can polish output, but only when the learner has (a) enough time,
(b) a focus on form, and (c) knows the explicit rule. In real-time speech there is
no time for the monitor.

**For our songs.** A song is **real-time**, so it feeds the *acquired* system, not
the monitor.
- Don't clutter a song with rule explanations — there's no moment to apply them
  while singing.
- Singing along is **fluent output from the acquired system**, which is the thing
  we want to build. The monitor (conscious rules) can be fed *separately*, on the
  sheet, if the learner wants it.

### 4 · The Affective Filter Hypothesis
**Theory.** An emotional barrier can block acquisition. High anxiety, low
confidence, or weak motivation **raise the filter** and stop input from reaching
the brain's processing systems. A safe, low-stress, motivating environment keeps
the filter **low** and lets input through.

**For our songs.** Songs are naturally low-filter, and we protect that:
- **No test, no correction.** The video never quizzes and never corrects — a wrong
  guess costs nothing.
- **Make it a pleasure to replay.** The house voice (warm city-pop female), clear
  but musical arrangements, and the joyful/gentle tone all keep the filter low. A
  song people *want* to hear again is more input, willingly.
- The **bouncing ball is an invitation, not a demand** — sing along if you like.
- This is also why `personal/` songs must "be good and arrive" — affect is the
  whole point there too.

### 5 · The Natural Order Hypothesis
**Theory.** Grammatical structures are acquired in a **predictable, universal
order**, regardless of the learner's age, first language, or the order a syllabus
teaches them in.

**For our songs.** We provide input **rich in natural structures** and let
acquisition take its own order, rather than forcing a grammar sequence.
- We don't drill grammar rules in a "correct" teaching order; we expose useful,
  high-frequency language in context and trust the natural order to do its work.
- **Honest nuance:** our gojuon series *does* have an order — but that order is
  about **reading the kana** (an orthography/*learning* skill for the writing
  system), which is separate from the acquisition order of grammar. The two
  coexist: the song teaches *reading* in a deliberate sequence while delivering
  *language* as comprehensible input.

---

## Practical applications → our design

| Krashen's classroom application | How a song / our project does it |
|---|---|
| **Comprehension over production**; allow a silent period before forcing speech | Songs are **listening-first**; singing along is optional and low-stakes. Just listening is a complete, valid use. |
| **Low-anxiety environment**; minimize harsh real-time correction | No quizzes, no error-correction, warm music, a voice you'll replay. |
| **Scaffold context**; visuals, gesture, storytelling, realia — no direct translation | Irasutoya **illustration per word**, the **"day" scene / RPG-rich** framing, **Japanese-only** lyrics. The illustration *is* the scaffold. |

---

## What this changes — and what it deliberately doesn't

- **Songs ask for output (singing).** That looks like "production," which Krashen
  says not to force early. But singing along is **low-anxiety rehearsal of
  acquired chunks**, not forced early speech — it supports acquisition and keeps
  the filter low. We never *require* it.
- **We accept some explicit "learning."** Reading kana is partly a conscious skill,
  and the sheet exists for learners who want rules. That's fine — it lives *beside*
  the song, never *on* it.
- **Pitch accent is not taught by song** (a melody overwrites it). Accepted limit;
  practiced separately. The spoken cold-open/tag is the one place a correct contour
  survives.

---

## Where this shows up in the repo

- `../README.md` → the learning-strand **guiding principle** (the one-liner).
- `../findings.md` **F-10** → the measured proof: same-onset word lists blend and
  don't teach; sentences (context) do. This is *i + 1* in practice.
- `screen.txt` rule (no romaji / no furigana / no gloss) → acquisition on the
  video; `learner.txt` → optional conscious learning on the sheet.
- `../house-style.md` → the warm house voice and joyful arrangements → a low
  affective filter.

---

## Source

Stephen Krashen, *Second Language Acquisition* theory — the Acquisition-Learning,
Input (i + 1), Monitor, Affective Filter, and Natural Order hypotheses, and his
classroom applications. Primary texts (kept in the local, git-excluded `books/`):
*The Natural Approach* and *Principles and Practice in Second Language
Acquisition*.
