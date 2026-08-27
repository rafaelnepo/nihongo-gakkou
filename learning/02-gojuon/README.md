# Episode 2 — 五十音 / "Amenbo no Uta"

**北原白秋, 「五十音」. Public domain. UNTESTED as of 2026-08-27.**
Nepô's idea (2026-08-27): restyle the traditional chants rather than only writing
new ones. This is the first of that strand.

## This is a different product from episode 1 and must be judged differently

あいさつ teaches **phrases in a situation**. 五十音 teaches **the sound system
itself** — it is an articulation exercise, still what Japanese voice actors and
announcers use to warm up, walking every consonant row against every vowel in
order. That is the one thing a song does better than any other medium, and it is
exactly the gap the pitch-accent limitation leaves open (`../README.md`).

**Success test:** does the mouth move better afterwards? *Not* can you fill a gap.

**Do not try to make it teach vocabulary.** あめんぼ, ささげ, なめくじ, まいまい,
らいちょう, いどがえ — none of this is N5 and none of it is meant to be. Selling
it as vocabulary makes it fail at that while stopping it doing what it is for.

## The design problem, and its answer

**五十音 has no hook.** Ten stanzas, entirely new material each time, zero
repetition — pure enumeratio, the exact opposite of "sticky like gum". Every
other song in this series is built on a returning chorus. This one has none.

**The answer was already in the poem: the five-kana run is the refrain.**
`アイウエオ` / `カキクケコ` / `サシスセソ` — same five-beat figure, same vowel
order, different consonant every time. That is anaphora at the level of *pattern*
rather than text, and it is also the entire lesson. So:

    LEAD   the tongue-twister line
    ALL    the five kana          ← unison
    LEAD   the second twister line
    ALL    the five kana          ← unison, closing the verse

**Nothing is cut and nothing is reordered.** The kana run keeps Hakushū's original
position and additionally repeats as the verse-closing unison. That repeat is the
only thing added to the poem.

**And it is built directly on findings.md F-07.** Suno puts both voices in unison
on the last line of a verse whatever your tags say. Here that habit is not a
defect to route around — unison is where a listener is invited to join in, and
this song wants everyone chanting the kana. Compose for the model's bias.

## How this text was verified — read this before generating

The text below was **reconstructed, then checked against the poem's own
constraint**, not copied from a printed source. Every automated fetch refused to
reproduce the verbatim text.

The check that was actually run: **each stanza must alliterate on its own row's
consonant.** カ行 gives かきのき・くりのき・きつつき・こつこつ・かれけやき — all k.
マ行 gives まいまい・みもしまい — which is also what fixes 蝸牛's reading as
**まいまい** rather than かたつむり, since a か-reading would break the row. All ten
stanzas pass. That is real evidence, and it is not proof.

**Check it once against a source before spending a generation:**
- <https://ja.wikisource.org/wiki/五十音_(北原白秋)>
- <https://www.benricho.org/kotoba_lesson/yoko_hakusyuu-50on-hurigana.html> (with furigana)

Copyright is not in question: Hakushū died 1942, Japan's term was then life+50 so
it expired in 1992, and the 2018 extension to life+70 did not revive lapsed
copyrights. It is carried by 青空文庫 and Wikisource, which host only public-domain
work.

## Two editorial calls that are Nepô's, not mine

**1 · Stanzas 9 and 10 teach kana that no longer exist.**
ヤ行 is `ヤ イ ユ エ ヨ` — the イ and エ are **placeholders**; modern ヤ行 has only
ya/yu/yo. ワ行 is `ワ ヰ ウ ヱ ヲ` — **ヰ (wi) and ヱ (we) are obsolete**, and ヲ
survives only as the object particle. A 2026 learner drilling those without being
told is being taught letters they will never see.

Three options, no default taken: keep them and **label** them (recommended — the
history is genuinely interesting and the poem stays whole); keep them silently
(dishonest); or stop at ラ行 (safe, and mutilates a complete work).

**2 · Forty-two lines is long — but generate it in ONE PASS.**
An earlier version of this file said to split it in half and join the halves.
That was tried on 2026-08-27 and failed: *"It came out too different."*
**Retracted — see findings.md F-09.** Two Suno generations share no voice, tempo
or arrangement; they are two songs, not two halves. If one pass really is too
long, the mechanism is Suno's own **Extend + "Get Whole Song"**, which conditions
on existing audio. Failing that, ship ア行–ナ行 and ハ行–ワ行 as *Lesson 1* and
*Lesson 2* and own the seam.

Note also that nobody has yet confirmed the full song fails in one pass. Try the
cheap thing first.

## Files

| File | What it is |
|---|---|
| `sheet.html` | The working sheet — kana, romaji, gloss, copy buttons. |
| `learner.txt` | Kanji + reading + romaji + vocabulary notes. |
| `suno.txt` | **100% kana.** The maximum-danger case for F-02 — 大角豆, 蛞蝓, 啄木鳥, 蝸牛, 雷鳥 are unguessable. あいさつ needed 3 changed lines; this needed a full transliteration. |
| `style.txt` | Four styles for the same lyric: **boom-bap hip hop** (recommended — 五十音 *is* a flow exercise), matsuri ondo, gospel, bossa nova. |

**The four styles are the point of this episode.** One fixed public-domain text
that can be re-dressed indefinitely is a recurring series slot, not a single song.
