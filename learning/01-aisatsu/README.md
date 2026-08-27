# Episode 1 — あいさつ / "Out the Door and Back"

**Generated 2026-08-27. First song of the series. The format works.**

The song is one day: it opens on a door closing (`いってきます`) and ends on the
same door opening (`ただいま`). Every phrase in it is a greeting **somebody else
has to answer** — which is the whole reason あいさつ is a song and not a list.

## Files

| File | What it is |
|---|---|
| `sheet.html` | The working song sheet. Learner lines + romaji + gloss, a toggle to strip the gloss, copy buttons. **This is the human-facing artifact** — open it, don't read the .txt. |
| `learner.txt` | Correct orthography. The version a learner may see. `は` stays `は`. |
| `suno-v1.txt` | What was actually generated. Everything worked except the voices. |
| `suno-v2.txt` | The duet fix. **UNTESTED.** Doubled lines + named voice tags. |
| `style.txt` | Four style prompts: A (used), A2 (duet-reinforced), B (doo-wop workaround), C (ondo). |

## Three structures in one song

1. **The door — pairs.** `いってきます／いってらっしゃい`, `ただいま／おかえりなさい`.
   True call-and-response. This is the hook and the entire product.
2. **The clock — a cycle.** Four greetings walked through one day in fixed order.
   The frame `〜の あいさつ` is **7 mora every time**, so native 七五調 meter does
   the work for free.
3. **The register — a suffix.** `おはよう ⟶ おはようございます`, chosen by who you
   are talking to. One suffix, three greetings.

## What the generation proved

- **Tempo 92 BPM is right.** Nepô: "super easy to follow along." Do not go faster.
- **The `っ` survived.** `いってきます` reads with the beat of silence intact,
  which means the song teaches mora-timing rather than breaking it.
- **`こんにちワ` worked.** The particle fix is validated — see `../findings.md` F-02.
- **The A/B voice alternation did NOT happen.** Diagnosed, not a mystery — see
  `../findings.md` F-04, and `suno-v2.txt` for the fix.

## The open judgment call

**Verse 2 (the ございます register layer) is arguably a different song.** The hook
and the clock verse teach a *situation*; verse 2 teaches a *rule about politeness*,
which is a grammar lesson wearing the same clothes. Eleven phrases plus a register
rule is a lot for two minutes at N5.

It is left in because it is cheap to cut and expensive to invent twice.
**If the gap test comes back weak, verse 2 is the first thing out** — and it becomes
its own episode, where one suffix and three greetings would carry a whole song.

## The gap test — still outstanding

Play it twice. Wait a day. Say `ふくろは` — no, wrong song — say **`ただいま`** and
see whether `おかえりなさい` comes back. That is the only measurement that decides
whether this series is worth twelve songs. Nothing else on this page substitutes
for it.
