# 05-naninuneno-ouchi — な行, the Home variation

Gojuon **row 5 (な に ぬ ね の)**, taught through a fun day at home — cook in a pot, grill
meat, cuddle a teddy bear, colour a picture, the cat naps. The **home** variation of three
な-row songs (home · `shizen` nature · `doubutsu` animals).

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines くま,
ねる, あそぶ, おにぎり, あまい, あおい — the F-13 ladder. Pairs with the **Female (city pop)**
voice. ぬ (the gojuon's hardest kana) fits best here — the toy-box words (ぬいぐるみ/ぬりえ/ぬの).

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Female JP City Pop) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 05-naninuneno-ouchi` → align →
`gen_registry` → `sync` → render → `gen_description`.
