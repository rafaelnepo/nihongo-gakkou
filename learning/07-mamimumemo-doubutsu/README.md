# 07-mamimumemo-doubutsu — ま行, the Animals variation

Gojuon **row 7 (ま み む め も)**, taught through animals — a tuna, a sunfish, a honeybee, a
centipede, a killifish, a mole, a butterfly. The **animals** variation of three ま-row songs
(`ouchi` home · `shizen` nature · animals), pairing with the **kids** voice.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines うみ,
いけ (な行), つち, えだ (た行), はっぱ — the F-13 ladder. ま行 is a clean animal row — a real
creature in every kana, no detours (a few aquarium/insect favourites).

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Kodomo JP + kids chorus) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 07-mamimumemo-doubutsu` → align →
`gen_registry` → `sync` → render → `gen_description`.
