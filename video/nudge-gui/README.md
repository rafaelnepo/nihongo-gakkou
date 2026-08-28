# The Iconotes Nudger

A single-window tool for fine-tuning a learning video's **karaoke sync** — the
last mile after WhisperX forced alignment, where a few lines still drift against
the vocal. Live [`@remotion/player`](https://remotion.dev/player) preview on the
left, every line with **Start** / **End** arrows on the right; tap an arrow and
the fill moves, the player cues to that spot, and the shift auto-saves to the
timing JSON. What you see is what renders — the GUI drives the very same
`LearningVideo` component the final render uses (via its `timingOverride` prop).

```bash
cd video
npm install       # first time
npm run nudge     # → http://localhost:3010
```

Open it in a normal browser (you need the audio). Pick a line, nudge, repeat.

## Three levels of nudging

Sung timing drifts differently from spoken: a held or rushed note pushes one word
out of place even when the line as a whole is right. So nudging is **hierarchical**
— work coarse to fine, from the "Nudge levels" panel:

1. **Block** — shift a whole **section** (all lines of a verse / refrain / bridge)
   together. Stored as `delay` on each line in the section.
2. **Line** — shift one line's **Start** or **End** independently; the syllables
   between re-space proportionally. Stored as `startShift` / `endShift`.
3. **Word** — micro-shift a single **word** inside a line, for the one that drifts
   on a held/rushed note. Stored as `wordShifts[]` (one offset per word; words
   split on spaces *and* commas, the `、` staying with the word it follows). Every
   word is nudgeable — including the first and last — and word shifts **cascade
   forward** within the line: a word pushed into the next carries it along, so
   words never overlap. The word-timeline bar shows each word's duration.

All three are a **non-destructive overlay** on `../timing/<id>.learning.json`. The
aligner's `chars[]` are never mutated — the template bakes the overlay onto a copy
at render time (`bakeLines` in `../src/LearningVideo.tsx`, which also applies
`applyWordShifts`), so every nudge is reversible and a re-align resets the slate.
The list groups lines by section with separators so blocks are easy to see.

### Cascade

`bakeLines` runs a forward pass after the per-line shifts: **a line can never
start before the previous line ends.** So a nudged end that spills past the next
line's start pulls that next start up to meet it, rippling forward — windows stay
ordered and non-overlapping, and the active-line hand-off never stumbles. The
clamp is applied at render and mirrored in the GUI read-outs (`bakeWindows`); the
stored shifts stay exactly as you set them.

## Keyboard

Click a line to select it, then:

| Key | Action |
|---|---|
| `←` / `→` | Start earlier / later (by the step size) |
| `⇧` + `←` / `→` | End earlier / later |
| `↑` / `↓` | Previous / next line (selects + cues to its start) |
| `R` | Replay the current line from its start (auto-stops at its end) |
| `Space` | Play / pause |
| `[` / `]` | Step size (0.02–0.2s) |

Up top: a step selector, a horizontal/vertical toggle, and a save badge. Drag the
divider between the panes to resize the player (remembered per browser).

## How it fits

- **`main.tsx`** — the app: the player, the line list, the nudge/seek/replay
  logic, and the debounced save.
- **`vite.config.ts`** — Vite root + a dev-only load/save API (`GET`/`PUT
  /api/timing`) that reads and writes `../timing/<id>.learning.json`, and serves
  `../public` at `/` so `staticFile()` resolves exactly as in a render.
- Targets `01-aiueo` by default (`SONG_ID` in `main.tsx`).

**Headless alternative:** `../../tools/nudge.mjs` applies the same shifts from the
CLI (`node tools/nudge.mjs <id> --list`, then `--line N --by ±s`) when a GUI is
overkill.

See `../WORKFLOW.md` → *Timing — the layered controls* for the full picture.
