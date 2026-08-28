# 05-naninuneno-shizen — な行, the Nature variation

Gojuon **row 5 (な に ぬ ね の)**, taught through the outdoors — a hot summer and sea waves,
a rainbow and morning light, a quiet marsh and the sun's warmth, tree roots and a wide field.
The **calm variation** of three な-row songs (`ouchi` home · nature · `doubutsu` animals),
for a koto × modern arrangement.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines うみ,
そら, あさ, はな, はる, たいよう — the F-13 ladder. Pairs with the **Male (koto)** voice. ぬ
(the gojuon's hardest kana) reaches a little here — marsh · mud · the sun's warmth.

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Male JP Koto Pop) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 05-naninuneno-shizen` → align →
`gen_registry` → `sync` → render → `gen_description`.
