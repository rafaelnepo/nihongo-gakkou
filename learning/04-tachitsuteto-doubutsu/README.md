# 04-tachitsuteto-doubutsu — た行, the Animals variation

Gojuon **row 4 (た ち つ て と)**, taught through animals — a raccoon dog, a crane, a tiger, a
dragonfly, a swallow. The **animals** variation of three た-row songs (`ouchi` home ·
`shizen` nature · animals), pairing with the **kids** voice for a lively zoo dance-along.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines しか,
さる, すな, す (か/さ行), そら, うみ — the F-13 ladder. た行 has good animal coverage; ち and
て are the thin rows (a garden eel, a gibbon, a paw — small documented detours).

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Kodomo JP + kids chorus) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 04-tachitsuteto-doubutsu` → align →
`gen_registry` → `sync` → render → `gen_description`.
