# 03-sashisuseso-gohan — さ行, the Mealtime variation

Gojuon **row 3 (さ し す せ そ)**, taught through a day of meals — shop, cook, eat, sit,
and a cozy close at grandma's. The **mealtime** variation of three さ-row songs (mealtime ·
`shizen` nature · `doubutsu` animals); さ行 is rich in food words, so the everyday cut is a
kitchen-and-table day.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines かう
(か行), あまい (nature), そら (あ行) — the F-13 ladder. Pairs with the **Female (city pop)**
voice.

## Files
- `song.json` — single source of truth (identity, `render{}`, `vocab[]`).
- `screen.txt` — on-screen lines (all-kana). Drives the video structure.
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Female JP City Pop) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 03-sashisuseso-gohan` → align →
`gen_registry` → `sync` → render → `gen_description`.
