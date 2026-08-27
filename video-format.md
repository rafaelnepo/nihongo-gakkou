# How each video works — the immersion-first format

The project in one line: **Japanese-learning songs delivered as sing-along lyric
videos**, where meaning comes from **context — the illustration, the scene, the
melody — never from translation**. The grounding theory is in
`reference/comprehensible-input.md`; this file is how that theory becomes a video.

---

## The one rule: no explanations inside the video

**Nothing on screen but the Japanese, the illustration, and the karaoke
highlight.** No translation, no romaji, no furigana, no grammar notes, no gloss.

Why: explanations break immersion and flip the learner from **acquisition** into
**study** (the Acquisition-vs-Learning distinction). The picture and the scene
carry everything needed to *understand*; anything a learner might want to
*study* lives **outside** the video (the word list, below). A video that stops to
explain is no longer compelling input.

---

## How a video is structured

Japanese-only, all kana on screen. Two cuts: **~1 min vertical** (Stories/Reels)
and **~3 min YouTube** (`findings.md` F-12 · `house-style.md`).

- **Intro** — a spoken/sung cold open (often the row refrain).
- **Verses** — the teaching body. Each **target word** is shown big with its
  **Irasutoya illustration**, then its **sentence**, with the target word
  **highlighted as the bouncing ball reaches it** (word → sentence, in context).
- **Refrain** — the sung-together hook (Suno sings a verse's last line in unison;
  that's where the learner joins in — F-07).
- **Bridge (long cut)** — "the day": the words recombine into one little scene.
- **Review (long cut)** — the sentences only, as a sing-along recap.

The only text ever on screen is the lyric line (`screen.txt`): correct kana, no
romaji, no furigana, no gloss.

---

## The word list ("What it teaches") — outside the video, on purpose

The vocabulary (word → sentence → meaning) is **not** in the video. It is a
**companion**, offered two ways:

- In the **video description** (a clean word list), and/or
- as a **link to the song's sheet** (the "What it teaches" table on the site).

Both learner flows are valid, and the list supports each:

1. **Study-first** → skim the list, learn the words, then watch/listen fully
   immersed.
2. **Listen-first** → listen once, then check the list for the words you didn't
   catch, then listen again.

This mirrors the pedagogy exactly: **the video is acquisition; the list is
optional, conscious learning** — kept beside the song, never on it.

### Where the list comes from
The "What it teaches" table is generated into each song's `sheet.html` from its
`song.json` `vocab` (via `tools/build_sheets.mjs`). So the list already exists on
the site; the description links to it, or pastes a plain version.

> **Open question / possible enhancement:** the current `sheet.html` is
> producer-facing (it also holds style prompts and Suno lyrics). If a clean
> viewer-facing word-list page is wanted, `build_sheets.mjs` can emit one (and a
> ready-to-paste `description.txt`) from the same `vocab` data. Decide when the
> first video ships — it may not be needed if the description text is enough.

---

## YouTube description template (per learning video)

```
<Title> — Japanese <row/topic> in songs

Learn <N> everyday Japanese words the natural way — no translation, just the
song, the pictures, and the meaning. Sing along.

▶ Words in this song (What it teaches):
  あさ (asa) — morning        → おはよう  (good morning)
  あめ (ame) — rain           → あさ から あめ  (rain since morning)
  …
  Full list & sheet: https://rafaelnepo.github.io/nihongo-gakkou/learning/<id>/sheet.html

How to use it: watch once for the feeling, then glance at the list for anything
you missed, then watch again. Or learn the list first — either works.

Illustrations by Irasutoya (いらすとや).
```

The word block can be pasted from the song's `learner.txt` / the sheet's "What it
teaches" table. Keep it Japanese + romaji + short meaning; no grammar lecture.

---

## Why this is the whole design, restated

A learning video here succeeds when someone **enjoys it enough to replay it** and
picks up the words **without noticing they studied**. Every rule above serves that:
immersion (no on-screen explanations), context (illustration + scene), and a word
list that waits outside the door for whoever wants it.
