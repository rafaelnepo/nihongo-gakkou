# 01-aiueo — the gojuon-by-words series, ROW 1 (あ行)

Each vowel is taught through small, high-frequency **daily-life words that start
with it**, and — as of v2 — **each word is shown IN USE** in a short sentence,
with the words recombining across the song into a tiny day.

Distinct from `02-gojuon` (the traditional 五十音 *chant*, restyled). Here each
song is one row of the syllabary, taught through useful vocabulary in context.

## v1 → v2 (learned from the first generation, 2026-08-27)
v1 was **words-only** (あ→あさ・あめ・あお). Nepô generated it and found two
problems (now `findings.md` F-10):
1. **Same-onset word lists blend** — "あ あさ あめ あお" runs together; you can't
   hear where one word ends.
2. **Words with no context don't teach production**, only recognition.

**v2 fixes both by putting every word in a short sentence** (word → sentence),
letting words recombine (いく taught with いえ, reused in うみ へ いく / えき へ
いく), and reading as a **day**: morning → home & dog → out to the sea → an
errand → a snack. `suno-v1.txt` is kept as the record; `suno-v2.txt` is current.

**This pulls the "context / RPG-rich" vision forward to song 1** — it's no longer
"words now, context later." Context from the start.

## The word set (frequency-weighted daily words), now with sentences
あ: あさ→おはよう · あめ→あさ から あめ · あお→あめ の あと そら は あおい
い: いえ→ただいま · いぬ→いえ に いぬ が いる · いく→いぬ と さんぽ に いく
う: うみ→うみ へ いく · うた→うた を うたう · うさぎ→うさぎ が いる
え: えき→えき へ いく · えんぴつ→えんぴつ を かう · えん→えんぴつ は ひゃくえん
お: おにぎり→おにぎり を たべる · おちゃ→おちゃ を のむ · おかね→おかね を はらう
Refrain: あ い う え お. Full glosses + the verbs/particles it quietly teaches: `learner.txt`.

## Two formats (Nepô, 2026-08-27)
- **Vertical Stories/Reels** — ~1 min, condensed (the words-only cut works here).
- **YouTube (horizontal)** — ~3 min, the full contextual version, filled with
  sentences rather than a repeated loop, so it never needs a replay.
Duration standard is in `../../house-style.md`.

## Two lengths (Suno performs lyrics once through — findings F-12)
- **`suno-v2.txt`** (~1:50) — PART 1 only, the contextual teach. The **short /
  vertical Stories-Reels** cut.
- **`suno-v3.txt`** (~3:00) — the **YouTube** cut: PART 1 → a **BRIDGE** that
  strings the words into one day → a **REVIEW** of the sentences only. Reaches
  length by ADDING varied content, not looping (a duplicated lyric risks the
  identical-repeat collapse, F-08).

## Voice (decided 2026-08-27, findings F-11)
House voice for the basic learning songs = **city pop + female Persona**. koto×
male and lo-fi are kept for other/moodier content. Make the Persona from the
winning city-pop take and set it in Custom mode.

## Files
- `learner.txt` — study sheet (word + sentence + romaji + meaning + what it teaches)
- `suno-v3.txt` — the ~3-min YouTube score (teach → day bridge → review)
- `suno-v2.txt` — the ~2-min short/vertical score (teach only)
- `suno-v1.txt` — the first, words-only score (kept as the record)
- `screen.txt` — the video text (hiragana), all parts marked + illustration map
- `style.txt` — style options, the Suno panel settings, and the main-voice/Persona plan

## Status
v3 written, **not generated**. Format not proven until the gap test.
