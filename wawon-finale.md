# わ行 (row 10) — design sketch for the finale

**Status: DRAFTED 2026-08-28 (stage 1).** This plan was executed. The finale ships as THREE
voice-siblings under `learning/` — `10-wawon-female` (city pop, house voice), `10-wawon-male`
(koto, calm send-off), `10-wawon-kids` (graduation singalong, lead + chorus) — Strategy B:
one lyric, three capstones, one per playlist. Recommended shape below was followed almost
verbatim. Decisions taken are recorded under *Open questions* at the bottom.

Original sketch (written 2026-08-28 while closing a session): the other 9 rows are done
(27 songs). わ行 is the last, and it's special, so decide the shape before writing lyrics.

## Why わ行 can't be a normal song

わ行 has only three kana, and two of them are not word-starters:
- **わ** — real words start with it (わに, わし, わた, わかめ…). Normal teachable vocab.
- **を** — *only* the object particle. Essentially **never** starts a word. Always read "o"
  (findings **F-16**). The whole series has been *using* を on every sentence.
- **ん** — **never** starts a word; it only *ends* syllables/words (りんご, ぱん, みかん…).

So you cannot make 3 groups × 3 words, and you cannot make three themed variations. わ行 needs
a different design.

## Recommended shape — a single GRADUATION / "the last sounds" song

One celebratory capstone song (not three theme-variations), because it ends the series:

1. **Intro** — refrain `わ を ん` (the three final kana).
2. **わ verse(s)** — the real new content: ~6–9 わ-words in sentences (they all share the わ
   onset, so F-10 blending applies hard → sentences are essential). Candidates:
   わに (crocodile), わし (eagle), わた (cotton), わかめ (seaweed), わっか (a hoop/ring),
   わふく (kimono), わなげ (ring-toss), わゴム (rubber band), わらび (bracken), わさび.
   (Animals わに/わし + food わかめ + things わた/わっか/わふく — enough for a rich verse.)
3. **を interlude** — a meta / consolidation beat, NOT new words. Celebrate the particle the
   learner has used all series: show it doing its job in already-known sentences — `りんご を
   たべる`, `うた を うたう`, `え を かく` — and name it: *"を — the little 'o' that joins
   things."* Reinforces F-16 (always "o", written を).
4. **ん interlude** — teach ん as the sound that **ends** words. Show words finishing in ん:
   りんご, ぱん, みかん, にほん, ぱんだ, きりん — and make it playful ("everyone hums んー").
   ん never leads; it's the finisher, which is a perfect note to end the whole gojuon on.
5. **Review / celebration** — the ultimate **F-13** payoff: recombine beloved words from across
   all 9 rows (あさ・ねこ・ほし・つき・うみ…) into a "you can read them all now!" verse.
6. **Outro** — `わ を ん`, then maybe the full `あ … わ を ん` sweep as a victory lap.

### Voices / playlists
Don't write three theme-variations. Instead render **one finale lyric in all three voices**
(Strategy B in `personas.md`) — Female / Male / Kids — so each per-voice playlist gets a
capstone. Or lead with the **Kids** voice (a joyful graduation singalong) and offer the others.
This is the natural place for the "same song × 3 personas" idea to shine.

### id / structure
- id: `10-wawon` (single song) — or `10-wawon-<voice>` if rendering the three-voice set as
  separate ids. Folder(s) under `learning/`. trackNo "10", row string `わをん`.
- The pipeline already handles short/odd rows (や行 proved 3-kana works; the を/ん interludes
  are just `bridge`/`review`-section lines in `screen.txt`, so `build_learning_timing` ingests
  them like any tail content). Put わ-words in `vocab[]`; put the を/ん/celebration material in
  `screen.txt`'s BRIDGE/REVIEW so it renders without needing "target" kana that don't exist.

## Alternatives considered (rejected)
- **Three theme-variations** — impossible (を/ん have no word-initial vocab).
- **Skip わ行** — no; the series should *land*, and ん is the satisfying final sound.
- **Fold わ into a pure whole-gojuon review** — good ideas overlap with step 5 above, but keep
  わ's own new words (わに/わし/…) so the last row still *teaches*, not only reviews.

## Open questions — RESOLVED 2026-08-28 (Nepô's call)
- **One song in three voices, or a kids-led finale?** → **One song × three voices (Strategy B).**
  Three sibling folders `10-wawon-{female,male,kids}`, same lyric, each a per-voice-playlist
  capstone. The kids cut is written as the natural lead (graduation singalong).
- **How much of step 5 (whole-series recombination)?** → **Full victory-lap verse.** The REVIEW
  section recombines one beloved word per row, あ→ら (あさ・かに・さかな・つき・ねこ・ほし・みかん・
  やぎ・りんご — all verified as real prior targets), + わに も いる, + ぜんぶ よめた！, + the
  ten-row-leader sweep あ か さ た な は ま や ら わ を ん. Lives in `screen.txt`'s REVIEW (tail),
  not `vocab[]`, since it's recombination, not new teaching.
- **id / folder naming?** → **`10-wawon` base, `-<voice>` per sibling** (`10-wawon-female` etc.),
  not `10-wawon-final` and not a `finale/` folder — matches the `NN-<slug>` convention.

### What shipped (stage 1)
- `vocab[]` = FOUR groups so a `わ を ん` refrain lands after each (F-07): わ (animals & food:
  わに・わし・わかめ), わ (things: わた・わふく・わっか), を (りんご・うた・え — the joiner in known
  sentences, always "o", F-16), ん (ぱん・みかん・きりん — every phrase ends on ん).
- `screen.txt` mirrors the full sung order; PART 1 / を / ん headers are plain `═══` rules the
  timing scaffolder treats as `skip` (vocab owns them), and only the `REVIEW` header routes the
  victory lap into the tail. No は/へ/を swaps needed (none present; を stays を).
- Rendered: `sheet.html` for all three (dashboard now 30 public songs). Lint: screen.txt is
  fully kana (no 行 in prose — write "wa-row"). Next: generate audio per voice, then stage 7→8.
