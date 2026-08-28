# 06-hahifuheho-doubutsu — は行, the Animals variation

Gojuon **row 6 (は ひ ふ へ ほ)**, taught through animals — a bee, a hedgehog, a sheep, an
owl, a pufferfish, a snake, a firefly, a polar bear. The **animals** variation of three
は-row songs (`gakkou` making · `shizen` nature · animals), pairing with the **kids** voice.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines ねこ,
いぬ (あ行), いけ (な行), うみ, なつ, よる — the F-13 ladder. は行 has strong animal coverage;
only へ is thin (へび is the one へ animal, plus a fence-cat and a room-dog).

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Kodomo JP + kids chorus) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 06-hahifuheho-doubutsu` → align →
`gen_registry` → `sync` → render → `gen_description`.
