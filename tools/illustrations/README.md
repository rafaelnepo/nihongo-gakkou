# illustrations — the Irasutoya pipeline

Each learning video puts one **Irasutoya illustration per word**, orbiting the
lyric (see `video-format.md`). This folder is the repeatable way to go from a
song's vocabulary to real illustrations copied into the video.

The catalog itself is the **sibling Irasutoya project** (`../../Irasutoya/`,
~36k illustrations in `images/`, also deployed at `irasutoya.mee.cc`). We
reference it; we do not vendor it. Chosen images are copied into
`video/public/il/<song>/` which is **git-ignored** — the art is never committed
here; credit goes in the video description (`© いらすとや`).

> **Hard cap: 18 distinct illustrations per video** (Irasutoya usage limit).
> Repeats of the same file across the bands don't count — only unique source
> files do. `fetch.mjs` refuses to run over the cap; it prints `N/18` on success.
> To stay under: reuse one file across related words, or set a word's `src` to
> `null` so it falls back to a placeholder card.

## The curated workflow (list → pick → apply → fetch)

Because the *right* illustration is a human call (the first video had many swapped
for better ones), picking is a **curation loop**: the tooling makes the word list
and records the choices; a person chooses the files. The loop is built to be
**auto-populated later** — a future step can pre-fill each `src` with a semantic
suggestion, leaving the human to confirm or override.

```bash
# 1 · LIST — scaffold the word lists from each song's vocab (≤18 words/song).
node tools/illustrations/scaffold.mjs --all        # or a single <id>
#   -> learning/<id>/illustrations.json  (items with w/r/m/s/cue, src:null)
#   MERGE-PRESERVING: never clobbers a src you already chose.

# 2 · PICK — regenerate the picker page, open it, paste a filename per word.
node tools/illustrations/build_picker.mjs          # -> illustrations.html
#   Linked from the dashboard; also deploys on GitHub Pages. Your typing is saved
#   in the browser. Each word has a COPY button (copies the kana to paste into
#   Irasutoya search) and a live PREVIEW square (shows the file you typed). Hit
#   "Copy picks" (per song) or "Copy ALL picks".
#   PREVIEW SOURCE: remote-first — the catalog's R2 origin img.encyclopedias.cc
#   (<stem>.webp thumb, /hi/<stem>.webp full — the same origin the mee.cc fansite
#   uses), so previews work on the deployed Pages site AND locally without file://
#   parent-folder issues. Falls back to the local ../../Irasutoya/images/ catalog
#   offline. Both constants (IL_REMOTE / IL_LOCAL) live at the top of the page JS.

# 3 · APPLY — paste that JSON blob back into the manifests.
pbpaste | node tools/illustrations/apply.mjs -     # or: apply.mjs picks.json
#   Writes src into each learning/<id>/illustrations.json; flags the 18-file cap.

# 4 · FETCH — copy the chosen art into video/public (git-ignored).
node tools/illustrations/fetch.mjs learning/<id>/illustrations.json
```

The picker's "Copy picks" emits exactly what `apply.mjs` eats:

```json
{ "10-wawon-female": { "wani": "animal_wani.png", "washi": "bird_washi.png" } }
```

`illustrations.html` is regenerated in CI (`.github/workflows/build-sheets.yml`) so
its word lists track `song.json` `vocab` automatically.

### Manifest shape
Per song: `learning/<song>/illustrations.json` — one item per word with `w` (kana),
`r` (romaji, the output filename), `m` (meaning), `s` (its sentence), `cue` (what to
picture / search hint), and `src` (the chosen catalog filename). Scaffolded from the
song's `song.json` `vocab`.

### Finding a `src` — the catalog query CLI
Use the project venv (has numpy) and semantic **hybrid** search (needs `ollama
serve` with `bge-m3` pulled):

```bash
Irasutoya/venv/bin/python \
  ../../Irasutoya/tools/pipeline/index/q.py find "犬の散歩のイラスト" --hybrid --limit 5
```

Substring `find` (no `--hybrid`) works too but is noisier; `similar <file>` finds
neighbors with no Ollama needed. Put the winning filename in the manifest's `src`.

**Picking rules of thumb:**
- Prefer **single-subject icons** over scenes-with-people.
- When a word has both a **composition** (e.g. a dozen pencils) and a **single
  item** (one pencil), take the single item — it reads far better tiled small in
  the bands.

### Review + credit (after fetch)

```bash
node tools/illustrations/fetch.mjs   learning/01-aiueo/illustrations.json   # copy into video/public/il/01-aiueo/<r>.png (enforces the 18 cap)
node tools/illustrations/contact.mjs learning/01-aiueo/illustrations.json   # build _contact.html to eyeball the picks
node tools/illustrations/credits.mjs learning/01-aiueo/illustrations.json   # write illustration-credits.txt for the video description
```

Swap any pick by editing its `src` and re-running `fetch`. `fetch` fails loudly on
a missing/typo'd filename or over the 18-illustration cap. `credits.txt` is the
paste-ready Irasutoya attribution + list of what's shown, for the description box.

## Tracked vs not
- **Tracked:** `illustrations.json` (the record of what we chose), the scripts
  (`scaffold.mjs`, `build_picker.mjs`, `apply.mjs`, `fetch.mjs`, `contact.mjs`,
  `credits.mjs`), `illustrations.html` (the picker page), and
  `illustration-credits.txt`.
- **Ignored:** `video/public/il/**` (the images) and `_contact.html`.
