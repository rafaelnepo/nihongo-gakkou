# 08-yayuyo-ie — や行 (short row), the Home variation

Gojuon **row 8 (や ゆ よ)** — a **short row** (three kana; い/え are borrowed from あ行) —
taught at home: a red roof and the kettle's steam, little fingers on a clean floor, tea in a
cup, a quiet night. The **home** variation of three や-row songs (home · `shizen` nature ·
`asobi` a fun day out).

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. 3 groups × 3 words
= 9 targets; refrain や ゆ よ. Recombines たべる, おちゃ, いえ — the F-13 ladder. Pairs with the
**Female (city pop)** voice. Naturally a short song (~2:00 full / ~0:45 vertical).

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Female JP City Pop) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 08-yayuyo-ie` → align →
`gen_registry` → `sync` → render → `gen_description`.
