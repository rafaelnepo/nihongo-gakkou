# 04-tachitsuteto-shizen — た行, the Nature variation

Gojuon **row 4 (た ち つ て と)**, taught through the outdoors — the sun and tall bamboo, a
mountain waterfall, dew on a flower, the night moon and the blue earth. The **calm
variation** of three た-row songs (`ouchi` home · nature · `doubutsu` animals), for a koto ×
modern arrangement.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines あさ,
やま, そら, はな, あおい, あかい — the F-13 ladder. Pairs with the **Male (koto)** voice.

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Male JP Koto Pop) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 04-tachitsuteto-shizen` → align →
`gen_registry` → `sync` → render → `gen_description`.
