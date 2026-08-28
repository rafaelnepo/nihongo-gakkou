# 03-sashisuseso-shizen — さ行, the Nature variation

Gojuon **row 3 (さ し す せ そ)**, taught through the outdoors and the seasons — cherry
blossoms, a mountain brook, white sand and violets, a summer cicada, the blue sky and a
spring breeze. The **calm variation** of three さ-row songs (`gohan` mealtime · nature ·
`doubutsu` animals), for a koto × modern arrangement.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines あめ,
あき, うみ, そら, かぜ, はる — the F-13 ladder. Pairs with the **Male (koto)** voice. Also
carries the hard せ row best of the three cuts (brook · cicada · vista).

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Male JP Koto Pop) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 03-sashisuseso-shizen` → align →
`gen_registry` → `sync` → render → `gen_description`.
