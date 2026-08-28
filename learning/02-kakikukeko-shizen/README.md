# 02-kakikukeko-shizen — か行, the Nature variation

Gojuon **row 2 (か き く け こ)**, taught through the outdoors — wind and a river, a tree
and yellow leaves, clouds and grass, a clear morning, ice and birdsong. The **calm
variation** of three か-row songs (`doubutsu` animals · `machi` town · nature),
written for a koto × modern arrangement.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. This cut
also solves the か-row's hard け verse best (けさ・けしき・けむり are fully on-theme).

## Files
- `song.json` — single source of truth (identity, `render{}`, `vocab[]`).
- `screen.txt` — on-screen lines (all-kana). Drives the video structure.
- `learner.txt` — study sheet (romaji + gloss + what it quietly teaches).
- `suno-v2.txt` / `suno-v3.txt` — Suno scores (~2-min teach / ~3-min cut).
- `style.txt` — voice/style notes (koto × modern, F-11).

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` → pick take → `audio/master.wav`, fetch `il/` →
`build_learning_timing 02-kakikukeko-shizen` → align → `gen_registry` → `sync` → render
→ `gen_description`.
