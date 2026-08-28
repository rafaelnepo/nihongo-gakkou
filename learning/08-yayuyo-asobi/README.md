# 08-yayuyo-asobi — や行 (short row), the Fun-Day variation

Gojuon **row 8 (や ゆ よ)** — a **short row** (three kana) — taught through a fun day out: play
baseball, meet a goat, a festival stall, the amusement park, a big snowman, a yacht, off to
kindergarten. The **fun-day** variation of three や-row songs (`ie` home · `shizen` nature ·
fun day out), pairing with the **kids** voice.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. 3 groups × 3 words
= 9 targets; refrain や ゆ よ. Recombines まつり, うみ, いく — the F-13 ladder.

**This cut takes the animals slot as a fun day out** — ゆ and よ have no beginner animals, so a
playful outing fits the kids voice better than a forced animals cut. It is also the ya-row's
one song with a **へ direction particle** (ようちえん へ いく → read "e").

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Kodomo JP + kids chorus) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 08-yayuyo-asobi` → align →
`gen_registry` → `sync` → render → `gen_description`.
