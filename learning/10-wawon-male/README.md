# 10-wawon-male — わ行 (row 10), the series FINALE · Male / koto cut

Gojuon **row 10 (わ を ん)** — the **last row**, and the **finale** of the whole series. It
can't be a normal 3-theme song: only **わ** starts words, **を** is only the object particle
(always "o", F-16), and **ん** never starts a word — it *ends* them. So this is a graduation
**"last sounds"** song: a わ teach, a を beat, a ん beat, and a **whole-gojuon victory lap**
(one word from every earlier row, あ→ら — the F-13 ladder cashed in).

**Status: lyrics drafted (stage 1).** No audio yet. Written 2026-08-28. Sung refrain **わ を ん**.

**This is the male / koto cut** — a calm, elegant send-off. The finale is written once and
rendered in **all three house voices** — Strategy B (`../../personas.md`): `10-wawon-female`
(city pop), `10-wawon-male` (this), `10-wawon-kids` (graduation singalong). Same lyric, three
capstones, one per playlist.

## Files
- `song.json` — single source of truth (render header + vocab: わ · わ · を · ん).
- `screen.txt` — on-screen lines (all-kana); its REVIEW section is the whole-gojuon victory lap.
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Male JP) → pick take → `audio/master.wav`,
fetch `il/` → `build_learning_timing 10-wawon-male` → align → `gen_registry` → `sync` →
render → `gen_description`.
