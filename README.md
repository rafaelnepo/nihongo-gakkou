# Nihongo Gakkou 日本語学校 — Sing It Twice

[![Build song sheets](https://github.com/rafaelnepo/nihongo-gakkou/actions/workflows/build-sheets.yml/badge.svg)](https://github.com/rafaelnepo/nihongo-gakkou/actions/workflows/build-sheets.yml)
[![Live site](https://img.shields.io/badge/live-rafaelnepo.github.io%2Fnihongo--gakkou-4a7a5e)](https://rafaelnepo.github.io/nihongo-gakkou/)

**Japanese-learning songs and sing-along lyric videos, made with Suno and
Remotion.** The premise: a song teaches the two things a classroom can't — the
sound system and mora timing — because Japanese conjugation already rhymes and
Japanese is mora-timed.

Started 2026-08-27 inside the Irasutoya project; **split into its own repo
2026-08-27** so it can have its own GitHub (and a GitHub Page for the dashboard).

---

## Quick start

```bash
# Browse everything (open in a browser):
open index.html                              # the dashboard — filter, copy style prompts

# Regenerate the song sheets + dashboard from the .txt/song.json source:
node tools/build_sheets.mjs                   # all songs
node tools/build_sheets.mjs learning/01-aiueo # one song

# The lyric-video engine (Remotion):
cd video && npm install && npm start          # Studio; see video/WORKFLOW.md

# Forced-align a generated song to its audio (WhisperX):
cd tools/align && .venv/bin/python align_song.py --audio … --timing … --write
```

No monorepo build; each sub-tool (`video/`, `tools/align/`) has its own deps.

---

## Three strands, one method

| | `learning/` | `personal/` | `yuba/` |
|---|---|---|---|
| **Who for** | Japanese learners, N5 | family (his wife & son) | Yuba Farm |
| **Public?** | Yes — YouTube / GitHub Page | **Never — see Privacy** | Case by case |
| **Pipeline** | All 11 stages | **Stops at stage 6 (sent)** | 0–6, then decide |

**These are three different products and mixing them would wreck all three.**

### learning/ — the series
`01-aisatsu` (greetings), `02-gojuon` (the restyled Amenbo chant), `01-aiueo`
(the gojuon-by-words series, row 1). A beginner who reads kana should sing along
on the **first** listen and use a whole sentence pattern by the **third**.

**Guiding principle — COMPREHENSIBLE INPUT.** Teach target items *in context*:
say the word, then show it USED in a short sentence, supported by the audio and
the illustration — never isolated word-drills. Words alone teach recognition,
not production, and a list of same-onset words even blends together (`findings.md`
F-10). So a learning song reads as a tiny scene (a day, an errand) from the very
first row. Full theory (Krashen's five hypotheses) and how each part applies:
`reference/comprehensible-input.md`.

### personal/ — songs for family
Short Japanese songs for his wife and son. **PRIVATE, never
published** (see Privacy). Adapt, don't translate; single voice; get the Japanese
read by a native speaker before sending.

### yuba/ — moods and feelings
Yuba is an 80-year-old Japanese-Brazilian farming community with its own theatre
(ユバ劇場) and choir. A song strand here joins something, not imports it. Scope
undecided.

---

## The premise

**Japanese conjugation already rhymes** — suffixes land meaning on the *end* of
the word, exactly where a song lands its rhyme. And Japanese is **mora-timed**, so
a song is a mora metronome. The known limit, accepted on purpose: a melody
overwrites lexical pitch accent (practiced separately; the cold open and tag are
spoken).

---

## Layout

```
nihongo-gakkou/
├── README.md         ← you are here
├── index.html        ← the DASHBOARD (filter songs, copy style prompts) — GENERATED data
├── PIPELINE.md       ← idea → publication, 11 stages. Rule zero matters most.
├── house-style.md    ← how the SET sounds like a set. READ BEFORE ANY STYLE PROMPT.
├── findings.md       ← what Suno ACTUALLY does. Every entry cost a real generation.
├── method.html · production-plan.html · reference/music-glossary.html  ← human-facing
├── tools/
│   ├── build_sheets.mjs  ← generates each song's sheet.html + the dashboard data
│   ├── kanji_grade.py    ← grade-limits the on-screen kanji
│   └── align/            ← WhisperX forced-alignment (Python venv) — see align/README.md
├── video/            ← Remotion lyric-video engine — see video/WORKFLOW.md
├── assets/           ← the sting and the sign-off (EMPTY — build these)
├── learning/  01-aisatsu · 02-gojuon · 01-aiueo
├── personal/  (private songs for his wife & son)   ← PRIVATE, git-excluded
└── yuba/      (empty)
```

Each song folder holds `.txt` sources (`suno-*.txt`, `learner.txt`, `screen.txt`,
`style.txt`), a `song.json` (metadata + finalized style prompts + vocab), and a
GENERATED `sheet.html`. **`.html` are human-facing; `.md`/`.txt` are agent-facing**
— Nepô works from the sheets while making music.

**Every sheet starts with `<!doctype html>` then `<meta charset="utf-8">`** — they
open as `file://`, so without a charset the browser falls back to Latin-1 and
Japanese becomes mojibake. `build_sheets.mjs` emits this automatically.

---

## The HTML output system

`sheet.html` per song is **generated, not hand-written**: `song.json` holds
structured metadata + style prompts + vocab; the lyric text is pulled live from
`suno-*.txt`. `index.html`'s song list is injected by the generator (between
`@generated` markers) from every song's `song.json`. Copy buttons on every style
prompt and lyric version. `01-aisatsu`/`02-gojuon` keep older **bespoke** sheets
(`"bespoke": true` in their `song.json` — the generator lists them but doesn't
overwrite them). `reference/music-glossary.html` ("Sound Words") is a hand-authored
music-terms + feedback glossary.

---

## The three rules that govern everything

1. **Three lyric documents, never one.** `suno.txt` is *misspelled* so the machine
   pronounces it right (`は`→`ワ`); `learner.txt` is correct + romaji + gloss;
   `screen.txt` is the video text (correct, kanji-limited, no romaji/furigana).
2. **The slot swap.** Repetition with exactly ONE variable teaches a *pattern*.
3. **Compose for what Suno actually does.** It sings a verse's last line in unison
   (put the phrase everyone should sing there); it drops lines that resemble their
   neighbours (keep near-identical lines apart). All measured in `findings.md`.

---

## Privacy — read before pushing or enabling Pages

**The `personal/` strand is for Nepô's wife and son and must never be published.**
- `personal/` is **git-excluded** (see `.gitignore`) — it never enters the repo,
  GitHub, or a GitHub Page.
- The dashboard (`index.html`) is generated with **public songs only** — the
  generator drops any song whose `song.json` has `"private": true`.
- Consequence: `personal/` is NOT backed up by this repo. Back it up separately.
- If you ever want the family songs version-controlled, use a **separate private
  repo**, not this one.

---

## External dependency — illustrations

The lyric videos put an Irasutoya illustration behind each word (`PIPELINE.md`
stage 8). Those illustrations come from the **sibling Irasutoya project**
(`../../Irasutoya/`), whose `tools/pipeline/index/q.py` finds an illustration for
a word. This project references that catalogue but does not contain it; the video
step copies chosen images into `video/public/`. Nothing else here depends on
Irasutoya.

---

## Docs index

| Read this | For |
|---|---|
| `PIPELINE.md` | idea → publication, the 11 stages (rule zero: only `learning/` pays the full cost) |
| `house-style.md` | series identity, the voice/Persona plan, duration standards |
| `findings.md` | measured Suno behaviour — read before generating |
| `reference/comprehensible-input.md` | Krashen's CI theory (the *why*), applied to how we make songs |
| `video-format.md` | how each video is structured (immersion-first) + where the word list goes |
| `reference/music-glossary.html` | music terms + a "what you feel → what to say" phrasebook |
| `video/WORKFLOW.md` | the Remotion engine: parametric template, add-a-song, timing |
| `tools/align/README.md` | WhisperX forced alignment (per-character timing) |

---

## Status & history — see `sessions/`

Current state and the running log of what changed each session live in
**[`sessions/`](sessions/)** — this keeps the README stable instead of letting
status pile up here. **Starting a session? Open `sessions/README.md`** (start /
close routines), then the newest dated log and its **Next** section.

Live: **https://rafaelnepo.github.io/nihongo-gakkou/** · CI auto-runs the sheet
generator on every push.
