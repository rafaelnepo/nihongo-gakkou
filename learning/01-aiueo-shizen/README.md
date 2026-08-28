# 01-aiueo-shizen — あ行, the Nature variation

Gojuon **row 1 (あ い う え お)**, taught through the outdoors — rain and the morning sun,
a pond and a stone, the blue sea, a hill and the big sky. The **calm variation** of
01-aiueo (a little day · animals · nature), written for a koto × modern arrangement.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines
01-aiueo's words (あめ, あお→あおい, あさ→あさひ, うみ) — the F-13 ladder.

## Files
- `song.json` — single source of truth (identity, `render{}`, `vocab[]`).
- `screen.txt` — on-screen lines (all-kana). Drives the video structure.
- `learner.txt` — study sheet (romaji + gloss + what it quietly teaches).
- `suno-v2.txt` / `suno-v3.txt` — Suno scores (~2-min teach / ~3-min cut).
- `style.txt` — voice/style notes (koto × modern, F-11).

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` → pick take → `audio/master.wav`, fetch `il/` →
`build_learning_timing 01-aiueo-shizen` → align → `gen_registry` → `sync` → render →
`gen_description`.
