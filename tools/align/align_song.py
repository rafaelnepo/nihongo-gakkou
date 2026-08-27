#!/usr/bin/env python3
"""
Forced-align a song's KNOWN lyrics to its audio with WhisperX, and write
per-character timings back into the Remotion timing JSON.

This is forced alignment, not transcription: we already know every word, so we
hand WhisperX the text and ask only *when* each character is sung. The Japanese
align model (wav2vec2, hiragana dictionary) needs kana normalized, so katakana
is folded to hiragana and spaces / punctuation / the ー mark are dropped from the
alignment text and interpolated back afterwards.

Usage:
    .venv/bin/python align_song.py \
        --audio ../../video/public/my-song.wav \
        --timing ../../video/timing/my-song.json \
        [--write]

Without --write it aligns and prints a report but does not touch the JSON.
"""
import argparse
import json
import sys

SKIP = set("　 、。・「」『』（）()！？!?,.…ーｰ~〜「」")  # not sung as their own sound


def kata_to_hira(ch: str) -> str:
    o = ord(ch)
    if 0x30A1 <= o <= 0x30F6:  # katakana block (small ァ … ヶ)
        return chr(o - 0x60)
    return ch


def build_align_text(lines):
    """Return (align_text, keep_map) where keep_map[j] = (line_idx, glyph_idx)
    of the j-th alignable character."""
    align_chars = []
    keep_map = []
    glyphs_per_line = []
    for li, line in enumerate(lines):
        glyphs = list(line["text"])
        glyphs_per_line.append(glyphs)
        for gi, g in enumerate(glyphs):
            if g in SKIP:
                continue
            align_chars.append(kata_to_hira(g))
            keep_map.append((li, gi))
    return "".join(align_chars), keep_map, glyphs_per_line


MIN_CHAR = 0.11  # a glyph must be lit at least this long to be readable


def debunch(starts, line_start, line_end):
    """WhisperX collapses characters on sustained/held sung notes into a blip.
    Enforce a minimum onset spacing; if that overflows the line (the tell-tale
    of bunching), redistribute the whole line evenly while KEEPING the reliable
    first onset. Well-spread lines pass through essentially unchanged."""
    n = len(starts)
    if n == 0:
        return starts
    o = list(starts)
    for i in range(1, n):
        if o[i] < o[i - 1] + MIN_CHAR:
            o[i] = o[i - 1] + MIN_CHAR
    if o[-1] > line_end - MIN_CHAR:
        base = starts[0]
        span = max(line_end - base, MIN_CHAR)
        o = [base + span * i / n for i in range(n)]
    return o


def interp_line(glyphs, known, line_start, line_end):
    """known: dict glyph_idx -> start_seconds. Returns list of {start,end} for
    every glyph, filling gaps by piecewise-linear interpolation and deriving
    each end from the next glyph's start."""
    n = len(glyphs)
    anchors = [(-1, line_start)] + sorted(known.items()) + [(n, line_end)]
    starts = [0.0] * n
    for i in range(n):
        # find bracketing anchors
        left = max((a for a in anchors if a[0] <= i), key=lambda a: a[0])
        right = min((a for a in anchors if a[0] >= i), key=lambda a: a[0])
        if left[0] == right[0]:
            starts[i] = left[1]
        else:
            frac = (i - left[0]) / (right[0] - left[0])
            starts[i] = left[1] + (right[1] - left[1]) * frac
    # enforce non-decreasing
    for i in range(1, n):
        if starts[i] < starts[i - 1]:
            starts[i] = starts[i - 1]
    # spread characters that WhisperX bunched on held notes
    starts = debunch(starts, line_start, line_end)
    chars = []
    for i in range(n):
        end = starts[i + 1] if i < n - 1 else line_end
        if end < starts[i]:
            end = starts[i]
        chars.append({"start": round(starts[i], 3), "end": round(end, 3)})
    return chars


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--timing", required=True)
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--device", default="cpu")
    args = ap.parse_args()

    with open(args.timing, encoding="utf-8") as f:
        timing = json.load(f)
    lines = timing["lines"]
    duration = float(timing.get("durationSeconds") or lines[-1]["end"] + 2)

    align_text, keep_map, glyphs_per_line = build_align_text(lines)
    print(f"Alignable characters: {len(align_text)}")

    import whisperx

    print("Loading audio…")
    audio = whisperx.load_audio(args.audio)
    print("Loading JA align model (first run downloads ~1.2 GB)…")
    model_a, metadata = whisperx.load_align_model(language_code="ja", device=args.device)

    segments = [{"text": align_text, "start": 0.0, "end": duration}]
    print("Aligning…")
    result = whisperx.align(
        segments, model_a, metadata, audio, args.device,
        return_char_alignments=True,
    )

    rchars = result["segments"][0].get("chars", [])
    print(f"WhisperX returned {len(rchars)} char entries for {len(align_text)} input chars")

    # Map returned chars (which carry the same characters we fed, in order) back
    # to display glyphs. Match on order; tolerate WhisperX emitting entries for
    # characters it could not time (start missing).
    known_by_line = {li: {} for li in range(len(lines))}
    aligned = 0
    # Some builds prepend a leading space entry; align by filtering to entries
    # whose char matches our fed sequence position-wise.
    if len(rchars) == len(align_text):
        pairs = zip(range(len(align_text)), rchars)
    else:
        # fall back: keep only entries whose 'char' is not whitespace
        filt = [c for c in rchars if c.get("char", "").strip() != ""]
        if len(filt) != len(align_text):
            print(f"  ! length mismatch after filtering ({len(filt)} vs {len(align_text)}).")
            print("  Will still map the min length positionally.")
        pairs = zip(range(min(len(filt), len(align_text))), filt)

    for j, c in pairs:
        st = c.get("start")
        if st is None:
            continue
        li, gi = keep_map[j]
        known_by_line[li][gi] = float(st)
        aligned += 1

    print(f"Anchored {aligned}/{len(align_text)} characters from audio; the rest interpolated.")

    # First pass: line start = first anchored char; raw end = last anchored char.
    raw = []
    for li, line in enumerate(lines):
        known = known_by_line[li]
        if known:
            first = min(known.values())
            last = max(known.values())
        else:
            first, last = line["start"], line["end"]
        raw.append((first, last))

    # Second pass: set windows so consecutive lines never overlap on screen.
    # A line holds until just before the next line's first sung character.
    for li, line in enumerate(lines):
        first, last = raw[li]
        start = max(0.0, first - 0.15)
        if li > 0:
            start = max(start, lines[li - 1]["end"] + 0.02)
        if li < len(lines) - 1:
            next_first = raw[li + 1][0]
            end = min(next_first - 0.05, last + 1.2)
        else:
            end = min(duration, last + 1.5)
        end = max(end, start + 0.3)
        line["start"] = round(start, 3)
        line["end"] = round(end, 3)

    for li, line in enumerate(lines):
        line["chars"] = interp_line(glyphs_per_line[li], known_by_line[li],
                                    line["start"], line["end"])

    timing["_aligned"] = {
        "tool": "whisperx",
        "anchored_chars": aligned,
        "total_chars": len(align_text),
    }

    # Report per line
    print("\nLine windows after alignment:")
    for li, line in enumerate(lines):
        n_known = len(known_by_line[li])
        print(f"  {li:2d} [{line['start']:6.2f}–{line['end']:6.2f}] {n_known:2d} anchored  {line['text']}")

    if args.write:
        with open(args.timing, "w", encoding="utf-8") as f:
            json.dump(timing, f, ensure_ascii=False, indent=2)
        print(f"\nWrote {args.timing}")
    else:
        print("\n(dry run — pass --write to save)")


if __name__ == "__main__":
    main()
