# 08-yayuyo-shizen — や行 (short row), the Nature variation

Gojuon **row 8 (や ゆ よ)** — a **short row** (three kana) — taught through the outdoors: a
tall mountain and a riverside willow, white snow and a red sunset, a lily, a starry night sky
and a four-leaf clover. The **calm variation** of three や-row songs (`ie` home · nature ·
`asobi` a fun day out), for a koto × modern arrangement.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. 3 groups × 3 words
= 9 targets; refrain や ゆ よ. Recombines かわ, にわ, ほし, はる — the F-13 ladder. Pairs with
the **Male (koto)** voice. Naturally short (~2:00 full / ~0:45 vertical).

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Male JP Koto Pop) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 08-yayuyo-shizen` → align →
`gen_registry` → `sync` → render → `gen_description`.
