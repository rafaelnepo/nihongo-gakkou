#!/usr/bin/env python3
"""
kanji_grade.py — lint a lyric file against the Japanese school kanji grades.

WHY THIS EXISTS
    Nepo's rule for the lyric videos: no romaji, no furigana, Japanese only —
    so the ONLY thing standing between a learner and the screen is which kanji
    are on it. "Limit the kanji" is a vibe until something checks it. This is
    the check.

    It turns a song into a grade: "this lyric is readable by someone who knows
    grade 1 kanji" is a fact a machine can verify, and it makes the video's
    fixed kanji panel a generated artifact rather than a hand-kept list.

USAGE
    python3 kanji_grade.py <lyric-file> [--grade N]

    Prints every kanji used, its grade if known, and whether the file clears
    the requested grade. Exit code 1 if it does not.

DATA HONESTY
    grades.json ships with GRADE 1 COMPLETE AND VERIFIED (80 kanji, counted).
    Grades 2-6 are deliberately EMPTY STUBS. A wrong kanji in a linter is a
    silent bug that teaches the wrong thing, so this tool would rather say
    "unknown" than guess. Fill them from the MEXT 学年別漢字配当表 when a song
    needs a higher grade:
        https://www.mext.go.jp/a_menu/shotou/new-cs/youryou/syo/koku/001.htm
    Anything not in a loaded grade is reported as UNKNOWN, never as "fine".
"""
import sys, json, unicodedata
from pathlib import Path

HERE = Path(__file__).parent
KANJI = lambda c: 'CJK UNIFIED' in unicodedata.name(c, '')

def load():
    p = HERE / 'grades.json'
    if not p.exists():
        sys.exit(f"missing {p} — see the docstring")
    return {int(k): set(v) for k, v in json.loads(p.read_text(encoding='utf-8')).items()}

def grade_of(ch, grades):
    for g in sorted(grades):
        if ch in grades[g]:
            return g
    return None

def main():
    args = [a for a in sys.argv[1:]]
    target = None
    if '--grade' in args:
        i = args.index('--grade'); target = int(args[i+1]); del args[i:i+2]
    if not args:
        sys.exit(__doc__)

    grades = load()
    text = Path(args[0]).read_text(encoding='utf-8')
    used = []
    for ch in text:
        if KANJI(ch) and ch not in used:
            used.append(ch)

    if not used:
        print("No kanji at all — fully kana. Readable at any level.")
        return 0

    rows = [(ch, grade_of(ch, grades)) for ch in used]
    known   = [(c, g) for c, g in rows if g is not None]
    unknown = [c for c, g in rows if g is None]

    print(f"{len(used)} distinct kanji in {args[0]}\n")
    for g in sorted({g for _, g in known}):
        chars = ''.join(c for c, gg in known if gg == g)
        print(f"  grade {g}  ({len(chars):>2})  {chars}")
    if unknown:
        print(f"  UNKNOWN   ({len(unknown):>2})  {''.join(unknown)}")
        print("            ^ not in any loaded grade list. Either above grade 1,")
        print("              or grades 2-6 are still empty stubs. Do not assume.")

    if target is not None:
        allowed = set().union(*[grades[g] for g in grades if g <= target]) if grades else set()
        over = [c for c in used if c not in allowed]
        print()
        if over:
            print(f"FAILS grade {target}: {''.join(over)}")
            print("Fix by rewriting those words in kana, or raise the song's grade.")
            return 1
        print(f"PASSES grade {target}.")
    print("\nFixed kanji panel for the video (copy as-is):")
    print("  " + "  ".join(f"{c}" for c in used))
    return 0

if __name__ == '__main__':
    sys.exit(main())
