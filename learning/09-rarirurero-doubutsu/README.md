# 09-rarirurero-doubutsu — ら行, the Animals variation

Gojuon **row 9 (ら り る れ ろ)**, taught through animals — a camel, a lion, a sea otter, a
squirrel, a tortoise, a red panda, an antelope, a donkey. The **animals** variation of three
ら-row songs (`ie` things · animals · `iro` colours), pairing with the **kids** voice.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines ねこ,
いぬ (あ行), おそい (か行) — the F-13 ladder.

**Honest note:** ら行 is a hard animal row. ら/り/れ are strong, but **る has NO beginner
animal** (borrows a blue azure-bird + its colour + a magnifier) and **ろ has only ろば**
(adds an alley cat and a corridor dog). Two documented detours; the things and colours cuts
are cleaner.

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Kodomo JP + kids chorus) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 09-rarirurero-doubutsu` → align →
`gen_registry` → `sync` → render → `gen_description`.
