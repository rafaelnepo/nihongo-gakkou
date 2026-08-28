# 02-kakikukeko-doubutsu — か行, the Animals variation

Gojuon **row 2 (か き く け こ)**, taught through animals. The **first of three か-row
songs** — animals · `machi` (town) · `shizen` (nature) — that teach the same five kana
with different vocabulary, so a learner practises reading the row several times without
a song repeating itself.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28 following the
comprehensible-input method (word → sentence, refrain-last unison, recombine row 1).

## Files
- `song.json` — the single source of truth (identity, `render{}` header, `vocab[]`).
- `screen.txt` — the on-screen lines (all-kana). Drives the video structure.
- `learner.txt` — the study sheet (romaji + gloss + what it quietly teaches).
- `suno-v2.txt` — Suno score, ~2-min teach (vertical short).
- `suno-v3.txt` — Suno score, ~3-min YouTube cut (teach → bridge → review).
- `style.txt` — voice/style notes (city-pop house voice, F-11).

## Next steps (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
3. Generate in Suno from `suno-v3.txt` (city-pop female Persona). Read `screen.txt`
   along on first listen to catch dropped lines (F-08).
6. Pick the take → `audio/master.wav`. Fetch illustrations → `il/` (the 15 romaji keys
   in `song.json.vocab[].r`).
7. `node tools/build_learning_timing.mjs 02-kakikukeko-doubutsu` → align → nudge.
8. `node tools/gen_registry.mjs` → `node tools/sync.mjs 02-kakikukeko-doubutsu` → render.
10. `node tools/gen_description.mjs 02-kakikukeko-doubutsu`.
