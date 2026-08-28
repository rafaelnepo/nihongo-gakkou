# 03-sashisuseso-doubutsu — さ行, the Animals variation

Gojuon **row 3 (さ し す せ そ)**, taught through animals — a monkey, a zebra, a sparrow, a
cicada, a walrus. The **animals** variation of three さ-row songs (`gohan` mealtime ·
`shizen` nature · animals), pairing with the **kids** voice for a lively zoo dance-along.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines くま
(か行), いぬ (あ行), うみ — the F-13 ladder.

**Honest note:** さ行 is the hardest row for animals. せ has few beginner animals (せなか is
a body-part detour) and そ has none (the そ verse teaches position words — そら/そこ/そと —
with an animal in each scene). Two documented detours, like か行's け and あ行's え. The
mealtime and nature cuts are the cleaner two さ-row songs.

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Kodomo JP + kids chorus) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 03-sashisuseso-doubutsu` → align →
`gen_registry` → `sync` → render → `gen_description`.
