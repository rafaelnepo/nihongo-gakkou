# 10-wawon-kids — わ行 (row 10), the series FINALE · Kids graduation singalong

Gojuon **row 10 (わ を ん)** — the **last row**, and the **finale** of the whole series, as a
joyful **graduation singalong**. It can't be a normal 3-theme song: only **わ** starts words,
**を** is only the object particle (always "o", F-16), and **ん** never starts a word — it
*ends* them. So this is a "last sounds" celebration: a わ teach, a を beat, a ん beat, and a
**whole-gojuon victory lap** (one word from every earlier row, あ→ら — the F-13 ladder cashed in).

**Status: lyrics drafted (stage 1).** No audio yet. Written 2026-08-28. Sung refrain **わ を ん**.

**This is the kids cut — and the natural finale.** A bright lead + children's chorus,
call-and-response (P3, validated F-14); the refrain わ を ん is the whole class in unison
(F-07). The finale is written once and rendered in **all three house voices** — Strategy B
(`../../personas.md`): `10-wawon-female` (city pop), `10-wawon-male` (koto), `10-wawon-kids`
(this). Same lyric, three capstones, one per playlist.

## Files
- `song.json` — single source of truth (render header + vocab: わ · わ · を · ん).
- `screen.txt` — on-screen lines (all-kana); its REVIEW section is the whole-gojuon victory lap.
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Kodomo JP + kids chorus) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 10-wawon-kids` → align →
`gen_registry` → `sync` → render → `gen_description`.
