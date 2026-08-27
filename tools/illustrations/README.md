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

## The three steps

**1 · List** — the words + contexts we need. Per song:
`learning/<song>/illustrations.json` — one item per word with `w` (kana), `r`
(romaji, the output filename), `m` (meaning), `s` (its sentence), `cue` (what to
picture), and `src` (the chosen catalog filename). Seed it from the song's
`song.json` `vocab`.

**2 · Search** — find a clean single-object `src` with the catalog's query CLI.
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

**3 · Copy + review + credit**

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
  (`fetch.mjs`, `contact.mjs`, `credits.mjs`), and `illustration-credits.txt`.
- **Ignored:** `video/public/il/**` (the images) and `_contact.html`.
