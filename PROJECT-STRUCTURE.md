# PROJECT STRUCTURE — where every file lives and why

**`README.md` = the three strands. `PIPELINE.md` = idea → publish. This file = the
folders, the naming, and the single source of truth.** If you only read one thing
before adding a song, read [Add a new song](#add-a-new-song) at the bottom.

---

## The one rule

**A song is authored in exactly one place — its folder under `learning/<id>/` (or
`personal/<id>/`).** Everything the render engine under `video/` needs is *generated*
or *synced* from there. You never hand-edit anything in `video/` to add or change a
song except the React components themselves.

```
learning/01-aiueo/            ← the ONLY place a human edits for this song
        │
        │  song.json  (identity + render header + vocab)   ← single source of truth
        │  screen.txt (the ordered on-screen lines)
        │  audio/master.wav · il/*.png                      ← canonical render assets
        ▼
  generators + sync (tools/*.mjs)
        │
        ▼
video/timing/01-aiueo.learning.json   (header generated, lines aligned+nudged)
video/src/songs/learning-registry.generated.ts   (the song list)
video/public/01-aiueo/{audio.wav, il/*.png}       (what Remotion reads)
        │
        ▼
video/out/01-aiueo/01-aiueo-landscape.mp4  …       (canonical renders)
```

---

## Per-song source folder

`learning/<NN-slug>/` — `<NN>` is the track number, `<slug>` is romaji (`01-aiueo`).

| File / dir | Purpose | Tracked in git? |
|---|---|---|
| `song.json` | **Single source of truth** — id, title, strand, `render{}` header block, and `vocab[]` (the words taught). Everything below derives from it. | ✅ tracked |
| `learner.txt` | Study doc — orthography + romaji + gloss (stage 1). | ✅ tracked |
| `screen.txt` | The video's ordered lines — all-kana, no romaji. Drives the teach/bridge/review structure. | ✅ tracked |
| `suno-v1..v3.txt` | Machine lyric docs for Suno (stage 1/3). | ✅ tracked |
| `style.txt` | Style-prompt notes. | ✅ tracked |
| `illustrations.json` | word → Irasutoya source mapping (stage 8 input for `tools/illustrations/fetch.mjs`). | ✅ tracked |
| `illustration-credits.txt` | Attribution. | ✅ tracked |
| `sheet.html` | **Published** study sheet (built by `tools/build_sheets.mjs`, deployed with `index.html`). | ✅ tracked |
| `README.md` | Notes for the song. | ✅ tracked |
| `audio/master.wav` | The chosen Suno take that actually renders. | 🚫 gitignored |
| `Songs/` | Raw Suno exports (kana-named, an archive — never rendered from). | 🚫 gitignored |
| `il/<romaji>.png` | Illustrations fetched from the Irasutoya catalogue. | 🚫 gitignored |
| `build/description.txt` · `build/vocab.md` | Generated publish text (stage 10). | 🚫 gitignored |

**Why the split:** text source is small and versionable, so it lives in git. Media
and generated artifacts are large and reproducible, so they stay out — regenerate
them any time from the tracked source. `sheet.html` is the one generated file that
*is* tracked, because it's a published web page, not a local build artifact.

---

## Naming

- **Filesystem + ids are slug-only:** `<NN>-<romaji>` (`01-aiueo`) is the folder, the
  timing stem, the `public/` subfolder, the Remotion composition id, the render
  target, and the output stem. One string, everywhere.
- **Japanese is display data, never a path.** `title` (`あいうえお`), `trackName`, `row`
  live *inside* `song.json` / the timing JSON and appear on screen — never as a
  filename. (No more `おなじおつきさま.mp4`.)

---

## Single source of truth: `song.json`

`song.json` carries a `render{}` block with the fields the video header needs:

```jsonc
"render": {
  "trackName": "ちいさな いちにち", "trackNo": "01", "row": "あいうえお",
  "channel": "iconotes", "style": "City Pop", "bpm": 92,
  "fps": 30, "width": 1920, "height": 1080,
  "countInSeconds": 1.1, "tailSeconds": 1.5
}
```

Generators derive everything else (never hand-sync these):

| Command | Reads | Writes |
|---|---|---|
| `node tools/build_learning_timing.mjs <id>` | `song.json` (`render`+`vocab[]`), `screen.txt`, `audio/master.wav` | `video/timing/<id>.learning.json` — header from `render{}`, teach lines from `vocab[]`, tail from `screen.txt`. **Merge-preserving:** on an already-aligned file it refreshes only the header and keeps the aligned `chars[]` + nudges. `--force` rebuilds lines from scratch. |
| `node tools/gen_registry.mjs` | glob `video/timing/*.learning.json` (public songs only) | `video/src/songs/learning-registry.generated.ts` — the song list. No more hand-edited `.tsx`. |
| `node tools/gen_description.mjs <id>` | `song.json` | `build/description.txt` (YouTube box) + `build/vocab.md` (words being learned). |
| `node tools/build_sheets.mjs [<id>]` | `song.json` + `suno-*.txt` | `learning/<id>/sheet.html` + the `index.html` dashboard. |

---

## Render assets → `video/public/`

Remotion's `staticFile()` can only read from `video/public/`. Assets are **synced
per song**, not hand-copied:

```
node tools/sync.mjs <id>     →  video/public/<id>/audio.wav
                                 video/public/<id>/il/<romaji>.png
```

The timing JSON points at these with `audio: "<id>/audio.wav"` and
`ilBase: "<id>/il"`. `sync.mjs` is idempotent (only copies changed files) and
`--all` syncs every song. `video/public/*` is gitignored — the subfolders are
disposable stage output.

---

## Timing + nudging

`video/timing/<id>.learning.json` is the pipeline's real artifact — it decouples
*when each word is sung* from *how the video looks*. It stays git-tracked (it's
versionable text). Its **header** is generated from `song.json`; its **lines** carry:

- `start`/`end` + per-glyph `chars[]` from WhisperX forced alignment (`tools/align`),
- non-destructive nudge fields (`startShift`/`endShift`/`wordShifts`/`delay`,
  and a whole-song `offsetSeconds`) — the levers the **Iconotes Nudger** drives.

Nudge one song: `npm --prefix video run nudge`, then open
`http://localhost:3010/?song=<id>` (a song dropdown appears once more than one song
is registered). It reads/writes only `video/timing/<id>.learning.json`.

---

## Outputs — canonical, overwrite

Renders are large, gitignored, and always reproducible, so there is **one current
file of each kind per song**; re-rendering overwrites it in place. No version
suffixes, no archive, no pileup.

```
video/out/
  <id>/
    <id>-landscape.mp4     # 1920×1080 master
    <id>-vertical.mp4      # 1080×1920 (9:16)
    <id>-preview.mp4       # low-bitrate proof
    <id>-short-30mb.mp4    # size-capped social cut
    <id>-thumb.png         # thumbnail
  _stills/                 # dev/QA frames — scratch, freely swept
```

`node tools/clean.mjs` empties `_stills/` and removes any loose file left at the
`out/` root (old flat masters, ad-hoc stills). Per-song folders are left alone.
`--dry` previews.

---

## Add a new song

```bash
ID=02-kakikukeko

# 1. Author the source (by hand): create learning/$ID/ with song.json (fill the
#    render{} block + vocab[]), screen.txt, suno-*.txt. Pick the Suno take:
#      learning/$ID/audio/master.wav
#    Fetch illustrations into learning/$ID/il/ (tools/illustrations/fetch.mjs).

# 2. Timing: scaffold from the source, then force-align to the vocal.
node tools/build_learning_timing.mjs $ID          # scaffold (placeholder)
python3 tools/align/align_song.py $ID              # fills start/end + chars[]
#   (optional) tune: npm --prefix video run nudge  → /?song=$ID

# 3. Wire it into the engine (all generated — no .tsx edits).
node tools/gen_registry.mjs                        # add $ID to the song list
node tools/sync.mjs $ID                            # stage assets into public/$ID/

# 4. Render.
npm --prefix video run render -- $ID          video/out/$ID/$ID-landscape.mp4
npm --prefix video run render -- $ID-vertical video/out/$ID/$ID-vertical.mp4

# 5. Publish text.
node tools/gen_description.mjs $ID                  # build/description.txt + vocab.md
```

No step touches a `.tsx` file. The full idea→publish flow (write, lint, generate,
audit, …) is in `PIPELINE.md`.
