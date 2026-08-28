# songs/video — WORKFLOW

How to make a lyric video for the songs project. This is PIPELINE stages 7–9.
Agent-facing (like the rest of the repo's `.md`); the `.html`/deliverables are
for Nepô. Written 2026-08-27, after the first video (a personal
lullaby) proved the format.

The engine is **parametric**: ONE template renders every song, driven by data +
typed props. Adding a song is a line in a registry and a timing JSON — no new
`.tsx`.

---

## The 3-minute version

```bash
cd songs/video
npm install                 # first time
npm start                   # Remotion Studio — pick a song, scrub, edit props live
npx remotion render aiueo-demo out/aiueo-demo.mp4 --crf=16   # final
```

To add a song: drop `<audio>` in `public/`, write `timing/<id>.json`, align it
(`../tools/align`), add one line to `src/songs/registry.ts`. Done — it's a new
composition in Studio and a render target.

---

## Architecture — why it's parametric

Remotion's whole point is that one composition renders many videos from props
(see `parameterized-rendering` in the Remotion docs). We use that:

- **`src/schema.ts`** — a **zod schema** (`videoSchema`) defines the editable
  props: `songId`, `palette`, `background`, `showBall`, `showTitleCard`. Remotion
  Studio turns this into a **visual props editor** — change the palette or toggle
  the ball from a panel, no code.
- **`src/metadata.ts`** — `calculateMetadata()` computes the video length from
  the **audio file itself** (`getAudioDurationInSeconds`), so no song hand-sets
  its duration. Falls back to the timing's own reckoning if there's no audio.
- **`src/Root.tsx`** — maps `SONGS` → one `<Composition>` each, all sharing the
  same component, schema and metadata. The composition **id is the render
  target** (`npx remotion render <id>`).
- **`src/LyricVideo.tsx`** — the template. Resolves the timing from `songId` and
  the colours from `palette`; everything else is the karaoke renderer.

**Series identity is FORMAT, not colour** (mirrors `../house-style.md` for
sound): the layout, the bouncing ball, the title card, and — later — the sting
and sign-off stay constant. The **palette** can vary per song. That's the visual
version of "one Persona, many arrangements."

### File map
```
src/
  index.ts        registerRoot
  Root.tsx        one <Composition> per song, from the registry
  schema.ts       zod schema for the editable props (Studio controls)
  metadata.ts     calculateMetadata — duration from the audio
  LyricVideo.tsx  the template: title card + karaoke line + bouncing ball
  NightSky.tsx    the 'night' background (moon, stars) — takes a palette
  palettes.ts     named palettes (add one → it's in the Studio dropdown)
  types.ts        SongTiming / LyricLine types + durationInFramesOf
  songs/registry.ts   SONGS list — add a song here
timing/<id>.json  the per-song timing (stage-7 artifact)
public/<id>.wav   the per-song audio
out/              renders (gitignored)
```

---

## Adding a song, step by step

1. **Generate the song** (see `../personal/…` or `../learning/…`) and put the
   audio in `public/<id>.wav`.
2. **Write `timing/<id>.json`** — copy an existing one. Fields:
   `title`, `dedication?`, `fps`, `width`, `height`, `audio`, `placeholder`,
   `titleCard`, `tailSeconds`, and `lines[]` (`text`, `section`). Text is the
   **screen** form: correct orthography, no romaji, no furigana.
3. **Align it** — `cd ../tools/align && .venv/bin/python align_song.py
   --audio ../../video/public/<id>.wav --timing ../../video/timing/<id>.json
   --write`. This writes per-line `start`/`end` and per-character `chars[]` from
   the audio. See `../tools/align/README.md`.
4. **Register it** — add `{ id: "<id>", timing: <import> }` to
   `src/songs/registry.ts` (and the JSON import at the top).
5. **Preview** in Studio (`npm start`), fix any timing (below), **render**.

---

## Timing — the layered controls

Timing lives in `timing/<id>.json` and has these levers, from coarse to fine:

| Lever | Where | Use when |
|---|---|---|
| **WhisperX alignment** | `../tools/align/align_song.py --write` | the base — per-character sync from the audio |
| **`offsetSeconds`** (whole song) | top of the JSON | fill is uniformly early/late. `+` = later |
| **`delay`** (one line) | on a line object | one whole line drifts. The nudge GUI's **Block** level bulk-sets it across a whole section (verse/refrain/…) |
| **`startShift` / `endShift`** (one line) | on a line object | one END of a line drifts — move just its in- or out-point; the aligned syllables re-space to fill. `+` = later. The nudge GUI's **Line** level |
| **`wordShifts[]`** (one word) | on a line object | a single WORD drifts inside a line (held/rushed sung note); one offset per space-separated word. The nudge GUI's **Word** level |
| **hand-timed line** | set a line's `start`/`end`, delete its `chars[]` | the aligner mistimes it (held/sustained notes); the template even-distributes glyphs across the window |

All nudges (`delay` / `startShift` / `endShift`) are **non-destructive** — the
template bakes them onto a copy of the aligned `chars[]` at render time
(`bakeLines` in `LearningVideo.tsx`), so the source `chars[]` are never mutated,
every nudge is reversible, and a re-align resets the slate.

`bakeLines` then **cascades**: a line can never start before the previous line
ends, so a nudged end that spills past the next line's start pulls that next
start up to meet it, rippling forward. This keeps the windows ordered and
non-overlapping — without it the active-line hand-off stumbles wherever two
windows cross. The clamp is applied at render (and mirrored in the GUI's
read-outs), so the stored shifts stay exactly as you set them.

**Known aligner limit:** WhisperX **bunches characters on sustained/held sung
notes** (a lullaby holds line-ends). `align_song.py` has a `debunch` pass that
spreads bunched lines, but a badly-held tail is best hand-timed (see the note in
a song timing JSON — its last lines may be hand-timed for exactly this).

### The nudge GUI — fine-tune sync visually (`npm run nudge`)

The fastest way to dial in the last few lines. `npm run nudge` opens a single
page (`nudge-gui/`, port 3010) with a **live `@remotion/player`** of the video on
the left and every line on the right, each with **Start** and **End** ◀ ▶ arrows.
Tapping an arrow updates the preview instantly, cues the player to that spot, and
auto-saves the shift to the timing JSON (which the final render then reads). It
passes the edited timing to `LearningVideo` via the `timingOverride` prop, so
preview == render.

Keyboard workflow (select a line by clicking it, then):

| Key | Action |
|---|---|
| `←` / `→` | Start earlier / later (by the step size) |
| `⇧`+`←` / `⇧`+`→` | End earlier / later |
| `↑` / `↓` | Previous / next line (selects + cues to its start) |
| `R` | Replay the current line from its start (auto-stops at its end) |
| `Space` | Play / pause |
| `[` / `]` | Step size (0.02–0.2s) |

**Headless alternative — `../tools/nudge.mjs`.** Same shifts from the CLI when a
GUI is overkill: `node tools/nudge.mjs <id> --list`, then
`--line N --by +0.1` (start), or `--offset ±s` for the whole song. `--by`
accumulates; a shift back to 0 removes the field, keeping git diffs clean.

**Studio still works too:** `npm start`, scrub with the audio, read the timecode,
edit the JSON by hand — it hot-reloads. The GUI just makes the loop tighter.

---

## Remotion capabilities to reach for (esp. the learning videos)

The lullaby used a fraction of Remotion. For the `learning/` series (stage-8 spec:
word highlight, kanji panel, waveform, beat-pulsing, illustrations), these are
the tools, all native:

| Need | Tool | Notes |
|---|---|---|
| **Text measuring** | `@remotion/layout-utils` `measureText` / `fitText` / `fillTextBox` | already used in `LyricVideo.tsx`; `fitText` sizes a line to a width |
| **Waveform / beat-pulsing** | `@remotion/media-utils` `useAudioData` + `visualizeAudio` | per-frame frequency amplitudes → bars, or pulse the moon/illustration/kana |
| **Illustration per word** | `<Img src={staticFile(...)}>` | pull Irasutoya hi-res webp (find via `q.py` in the **sibling Irasutoya project** — see README → External dependency), copy into `public/`. This is where the video is "made of the encyclopedia." |
| **Scene transitions** | `@remotion/transitions` `<TransitionSeries>` | fade/slide/wipe between intro→verse→outro or slot-swaps |
| **Kanji panel held to grade** | `songs/tools/kanji_grade.py` | already generates the fixed panel; render as a static sidebar |
| **Captions data shape** | `@remotion/captions` `Caption` type | standard structure if we grow beyond our JSON |

**On captioning / Whisper:** Remotion ships `@remotion/install-whisper-cpp`
(`transcribe` + `tokenLevelTimestamps`/`t_dtw`, Japanese supported) — an all-Node
alternative to our Python WhisperX venv. **But it *transcribes* (guesses the
words)**, unreliable on sung Japanese and won't match the exact lyrics. Since we
always KNOW the lyrics, **forced alignment (what `tools/align` does) stays more
accurate.** Keep it.

---

## Learning-video design notes (differ from the lullaby)

The lullaby is one mood. Learning videos are pedagogical, so the template will
grow a **constant chrome** (kept every episode) around a **swappable stage**:

- **Constant chrome** (series identity): the bouncing ball / karaoke, the kanji
  panel position, the sting + sign-off, safe margins, the title/sign-off pattern.
- **Swappable stage** (per song): background + palette per genre (koto/traditional
  vs boom-bap, etc.), and the illustration set.
- **Rules from the song docs carry over:** screen text is kanji-limited to the
  song's grade (`kanji_grade.py`), **no romaji, no furigana** on screen, and the
  slot-swap (one variable at a time) is a *visual* idea too — highlight the swapped
  word.

---

## Moodboard & references — keep it light, keep drift out

The risk to a *series* is visual drift between episodes, not tech. Two cheap
guards (not yet built — do them before episode 2):

- **`references/`** — 5–10 saved screenshots/links of styles to aim at.
- **`house-visual-style.md`** — the visual constants that make it a set (type =
  Zen Maru Gothic, the ball language, sting/sign-off, kanji-panel position,
  "palette swaps, layout doesn't"). The picture-side twin of `../house-style.md`.

---

## Gotchas paid for already

- **Font must be loaded before measuring / before capture.** The template gates
  render on `font.waitUntilDone()` via `delayRender`, and re-measures when the
  font becomes ready (the `fontReady` memo dep). Don't remove that.
- **`AbsoluteFill` has no `from` prop** (that's `<Sequence>`); a stray `from={-61}`
  once slipped into `NightSky.tsx`. Removed.
- **First render downloads Remotion's headless Chromium** (~90 MB) and the JA
  align model (~1.2 GB), both cached after.
- **`out/` and `public/*.wav` are big** — keep them gitignored.
