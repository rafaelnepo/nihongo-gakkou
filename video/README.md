# songs/video — Remotion lyric-video templates

Isolated from the fansite: its own `package.json`, its own `node_modules`,
nothing here is imported by `irasutoya-fansite/` or touched by a repo build.
This is **PIPELINE.md stages 7–9**. ONE parametric template renders every song
from a **stage-7 timing JSON** — so re-timing or adding a song never means
touching the template.

**→ Read `WORKFLOW.md` for the full workflow, architecture, and how to add a song.**
This README is the quick start.

## Run it
```bash
cd songs/video
npm install          # first time only
npm start            # opens Remotion Studio — scrub the timeline live
```

## Render an MP4
```bash
npx remotion render onaji-tsuki out/onaji-tsuki.mp4
```
A single still (fast visual check):
```bash
npx remotion still onaji-tsuki out/frame.png --frame=250
```

## How a song is wired (parametric)
1. `public/<id>.wav` — the audio.
2. `timing/<id>.json` — the lyrics + per-line/char timing (**stage-7 artifact**).
   Text is the **screen** form: correct orthography, no romaji, no furigana.
3. `src/songs/registry.ts` — add one `{ id, timing }` line.

That's it — it becomes its own composition in Studio and a render target. The
template (`src/LyricVideo.tsx`, `NightSky.tsx`, `palettes.ts`) is shared; props
(`songId`, `palette`, `background`, `showBall`, `showTitleCard`) are typed by
`src/schema.ts` and editable in Studio. Duration is computed from the audio by
`src/metadata.ts`. See `WORKFLOW.md`.

## When the audio is ready (turning the placeholder into the real thing)
1. Generate the song (see `../personal/onaji-tsuki/`).
2. Put the file in `public/` (e.g. `public/onaji-tsuki.mp3`).
3. In `timing/onaji-tsuki.json`: set `"audio":"onaji-tsuki.mp3"`,
   `"placeholder":false`.
4. Get the timings automatically with **`../tools/align/`** (WhisperX forced
   alignment) — it writes per-line `start`/`end` **and** per-character `chars[]`
   from the audio, which is what drives the bouncing ball. See that folder's
   README. Or hand-tune in Studio (~20 min). This is PIPELINE stage 7.

## Sing-along mode (bouncing ball + karaoke light-up)
Automatic. Each line lights its glyphs as they're sung and a red ball bounces
along, landing on each character at its onset. It reads per-character `chars[]`
from the timing JSON (from the aligner); with no `chars` it distributes glyphs
evenly across the line, so the ball works even before alignment.

## Scope note
`onaji-tsuki` is a **personal/ strand** song — PRIVATE, for Yuuto, never
published. The video is a thing to send him, not a YouTube deliverable. The same
template will serve the `learning/` series, which is where stage 8 formally belongs.
