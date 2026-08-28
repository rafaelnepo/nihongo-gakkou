# 02-kakikukeko-machi — か行, the Town variation

Gojuon **row 2 (か き く け こ)**, taught through a trip into town — an umbrella, a key,
shoes, the car, a ticket, the park. The **town variation** of three か-row songs
(`doubutsu` animals · town · `shizen` nature) teaching the same five kana with
different vocabulary, so the row is practised without a song repeating.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. The closest
of the three to 01-aiueo's "little day", and the most everyday-useful vocabulary.

## Files
- `song.json` — single source of truth (identity, `render{}`, `vocab[]`).
- `screen.txt` — on-screen lines (all-kana). Drives the video structure.
- `learner.txt` — study sheet (romaji + gloss + what it quietly teaches).
- `suno-v2.txt` / `suno-v3.txt` — Suno scores (~2-min teach / ~3-min cut).
- `style.txt` — voice/style notes (city-pop house voice, F-11).

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` → pick take → `audio/master.wav`, fetch `il/` →
`build_learning_timing 02-kakikukeko-machi` → align → `gen_registry` → `sync` → render
→ `gen_description`.
