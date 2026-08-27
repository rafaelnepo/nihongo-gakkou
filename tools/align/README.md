# tools/align — WhisperX forced alignment

Turns a song's **known lyrics** + its audio into **per-character timings** for the
lyric video (the bouncing ball + karaoke light-up). This is PIPELINE **stage 7**,
done by machine instead of by hand.

It is *forced alignment*, not transcription: we already know every word, so
WhisperX only answers *when* each character is sung. Result on おなじ おつきさま:
**199/199 characters anchored** to the audio on the first run.

## Setup (once)
Uses **Python 3.12** (torch has no 3.14 wheels yet) in a local venv:
```bash
cd songs/tools/align
python3.12 -m venv .venv
.venv/bin/pip install whisperx
```
First alignment run downloads the Japanese wav2vec2 align model (~1.2 GB), cached
after.

## Run
```bash
cd songs/tools/align
.venv/bin/python align_song.py \
  --audio  ../../video/public/onaji-tsuki.wav \
  --timing ../../video/timing/onaji-tsuki.json          # dry run: prints a report
# add --write to save the chars[] back into the timing JSON
```

## What it does
- Reads the display lyrics from the timing JSON.
- Normalizes for the JA align model: **katakana → hiragana**, and drops spaces /
  punctuation / the ー mark from the alignment text (they carry no separate sound),
  remembering their positions.
- Aligns the whole song in one pass (robust: no reliance on rough per-line windows).
- Maps character timestamps back to every **display** glyph, interpolating the
  dropped ones, and derives each line's `start`/`end` from its sung span (clamped
  so consecutive lines never overlap on screen).
- Writes `chars[]` (one entry per `Array.from(text)` glyph) into each line.

## Notes
- **The `chars` arrays are generated** — don't hand-edit them; re-run the aligner.
- The video template falls back to even character distribution when `chars` is
  absent, so the ball works even before alignment — alignment just makes it land
  on the real syllables.
- `.venv/` is heavy (torch); it is gitignored.
