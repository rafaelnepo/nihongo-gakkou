# 01-aiueo-doubutsu — あ行, the Animals variation

Gojuon **row 1 (あ い う え お)**, taught through animals — an ant, a dog, a rabbit, a
shrimp, a wolf. A sibling of the original **01-aiueo** (a little day): same five kana,
fresh words, so the row is practised without a song repeating.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Deliberately
recombines 01-aiueo's words (いぬ, うさぎ, うみ, たべる, うたう, あさ) — the F-13 ladder.

## Files
- `song.json` — single source of truth (identity, `render{}`, `vocab[]`).
- `screen.txt` — on-screen lines (all-kana). Drives the video structure.
- `learner.txt` — study sheet (romaji + gloss + what it quietly teaches).
- `suno-v2.txt` / `suno-v3.txt` — Suno scores (~2-min teach / ~3-min cut).
- `style.txt` — voice/style notes (city-pop house voice, F-11).

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` → pick take → `audio/master.wav`, fetch `il/` →
`build_learning_timing 01-aiueo-doubutsu` → align → `gen_registry` → `sync` → render →
`gen_description`.
