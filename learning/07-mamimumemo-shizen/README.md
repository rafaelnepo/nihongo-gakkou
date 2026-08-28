# 07-mamimumemo-shizen — ま行, the Nature variation

Gojuon **row 7 (ま み む め も)**, taught through the outdoors — a green pine and marimo in
the lake, a quiet lake and a harbour, field and village, buds and birds, a deep forest and
red maples. The **calm variation** of three ま-row songs (`ouchi` home · nature · `doubutsu`
animals), for a koto × modern arrangement.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines みず,
やま, はっぱ, ふね, えだ, はる — the F-13 ladder. Pairs with the **Male (koto)** voice. め uses
the 芽 (tree-bud) reading — a tidy seasonal fit.

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Male JP Koto Pop) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 07-mamimumemo-shizen` → align →
`gen_registry` → `sync` → render → `gen_description`.
