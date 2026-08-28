# 05-naninuneno-doubutsu — な行, the Animals variation

Gojuon **row 5 (な に ぬ ね の)**, taught through animals — a catfish, a sloth, a chicken, a
cat and mouse, a field hare and a stray cat. The **animals** variation of three な-row songs
(`ouchi` home · `shizen` nature · animals), pairing with the **kids** voice.

**Status: lyrics drafted (stage 1–2).** No audio yet. Written 2026-08-28. Recombines くま,
かえる (か行), はっぱ, とり (た行) — the F-13 ladder.

**Honest note:** な行 is a hard row for animals. **ぬ has NO beginner animal at all** (the
gojuon's toughest kana) — its verse uses a stuffed animal, a pond frog, and a soft cloth. な
and に reach a little too (slug / macaque / python). The home and nature cuts are cleaner.
Nice touch in the の verse: のねずみ / のうさぎ / のらねこ are all the "wild/field" (野) forms.

## Files
- `song.json` — single source of truth. `screen.txt` — on-screen lines (all-kana).
- `learner.txt` — study sheet. `suno-v2/v3.txt` — Suno scores. `style.txt` — voice notes.

## Next (see `../../PIPELINE.md` + `../../PROJECT-STRUCTURE.md`)
Generate in Suno from `suno-v3.txt` (Persona: Kodomo JP + kids chorus) → pick take →
`audio/master.wav`, fetch `il/` → `build_learning_timing 05-naninuneno-doubutsu` → align →
`gen_registry` → `sync` → render → `gen_description`.
