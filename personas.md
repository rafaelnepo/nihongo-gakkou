# Personas — a small cast of house voices

**Opened 2026-08-28 (Nepô).** `house-style.md` argued for **one** Persona ("one voice,
many arrangements") to make the set feel like a set. This doc *evolves* that: keep a
small **cast** of personas, each internally consistent, and turn the choice of voice
into a product axis. It's only affordable because AI generation makes re-voicing a song
nearly free — see [Why this is only possible now](#why-this-is-only-possible-now).

---

## The cast (three personas)

| # | Persona | Character | Home arrangement |
|---|---|---|---|
| **P1** | **Female** | Cute, bright, warm | City pop (the current house voice — findings **F-11**) |
| **P2** | **Male** | Calm, elegant | Koto × modern |
| **P3** | **Kids** | Playful, joyful, fun | Children's-song (call & response + kids chorus) — [designed below](#the-kids-persona-p3) |

P1 is validated and shipping (01-aiueo). P2 is already used as the "calm cut" arrangement
on the nature variations. **P3 is new and is what this session designs.**

---

## Two strategies (both good, not exclusive)

### Strategy A — theme-paired (loose 1:1)
Each lyric **variation** gets the voice that fits its world. The three variations we
already write per row map naturally onto the three personas:

| Variation | Persona | Why |
|---|---|---|
| a human "day" (01-aiueo, 02-…-machi) | **P1 Female · city pop** | everyday, warm, bright |
| **animals** (…-doubutsu) | **P3 Kids · playful** | kid-compelling; call-&-response; a dance-along |
| **nature** (…-shizen) | **P2 Male · koto** | calm, elegant, seasonal |

One row → three songs → three voices. Maximum variety per row, and each song wears the
voice that suits it.

### Strategy B — same song × three personas → a **playlist per voice**
Render the **same** lyric+arrangement family across **all three** personas, then group by
voice into playlists:

- **Female playlist** — every song in P1.
- **Male playlist** — every song in P2.
- **Kids playlist** — every song in P3.

Now a listener picks by preference or occasion: *prefer a female voice?* → the female
playlist. *Kids' party?* → the kids playlist. *Winding down?* → the calm male koto
playlist. Same curriculum, three front doors.

**A and B compose.** Write three themed variations per row (Strategy A gives each its
best-fit voice), AND re-voice the strongest ones across all three personas (Strategy B
builds the per-voice playlists). The catalog becomes a grid: *row × theme × voice.*

---

## Why this is only possible now

Re-cutting one song in three genuinely different voiced arrangements — a female city-pop
take, a male koto take, a kids' sing-along — is, in traditional production, **three times
the studio time, three session singers, three arrangements.** It's slow and expensive, so
nobody builds a catalog that way. AI generation drops that cost to near zero: the lyric
and timing are the real work (and they're already done, once), and a persona swap is a
re-generate. **This is a real differentiator, not a gimmick** — a small team can offer
what a label's economics can't. Nepô, 2026-08-28: *"This is something that isn't readily
available… because it's time consuming and expensive."* Flagged as **a give-it-a-go-later**
— worth exploiting once the kids voice is proven.

---

## How this relates to `house-style.md`

`house-style.md` still holds **within** a persona: a persona is a coherent identity, and
everything it says about Personas (build a single-voice **seed track**, don't stack
identity controls, don't contradict the Persona in the style prompt, run the
recognition / controlled-variation / boundary tests) applies **per persona**. What
changes: cohesion now lives **inside** each persona/playlist, and variety lives **across**
them. "One voice, many arrangements" becomes "**a few voices, each a coherent playlist.**"
The series signature (a sonic sting, a fixed sign-off, the format) sits **above** all
three voices and is what still makes them one *set*.

---

## The kids persona (P3)

Designed 2026-08-28 from a survey of Japanese children's music (sources below).

### References
- **Traditional — わらべうた / 童謡 / 唱歌.** *Warabe-uta* (Tōryanse 通りゃんせ, かごめかごめ)
  are old nursery rhymes, often **pentatonic** and sung nearly a cappella with a
  call-and-response feel. *Dōyō* (Shabondama シャボン玉, Ichinensei ni Nattara 一年生に
  なったら) are simple, singable tunes — the Kitahara Hakushū / Nakayama Shinpei lineage.
  Takeaway: **simple, pentatonic-leaning melody; repetition; a chant you can join.**
- **Artistic / educational — Design Ah (デザインあ), music by Cornelius.** Minimalist,
  rhythmic, "quirky yet melodic," contemplative pacing, built on **observing everyday
  objects** and counting until they become an "ah!" discovery. This is *our word →
  illustration method in another medium* — the closest reference in spirit. Takeaway:
  **playful rhythmic motifs, a counting/observation frame, sound-design accents.**
- **Modern playful — the おかあさんといっしょ world.** A song **leader (うたのおにいさん /
  おねえさん) + a children's chorus**, guitar-led, ages 2–4. **ケロポンズ's エビカニクス**
  (Ebi Kani-kus) — an aerobics dance song by a kindergarten-teacher duo, 100M+ views,
  built on **hand gestures** (a shrimp and a crab!) and call-and-response. **だんご3兄弟**
  — a playful tango novelty that became a national hit. Takeaway: **a lead calling, kids
  answering; a body/hand action; irresistibly repeatable.**

### Musical DNA
- **Bright, simple, danceable, repetitive.** Pentatonic-leaning melody.
- **Call-and-response**: a lead voice calls the word, a **kids chorus** echoes it. This is
  the method (repetition) made into the arrangement — *and* it's exactly the texture Suno
  handles reliably: a lead + an answering **group** is an arrangement texture, not a
  second soloist (findings **F-04** fix 2, **F-07**). Our unison-last rule (F-07) becomes
  literal: **the row refrain (か き く け こ) is sung by the whole kids chorus** — the
  classroom singing together.
- **Instrumentation**: glockenspiel, xylophone, marimba, toy piano, ukulele, hand claps,
  woodblock, recorder, bright brass stabs, bouncy upright bass, simple happy drums.
  Optional Design-Ah-style percussive/electronic accents for a modern edge.
- **Tempo**: upbeat but still singable on first listen — **~100–108 BPM**. Clarity beats
  energy; the F-01 spirit (a learner must be able to sing along) still governs.
- **Affect**: joyful, a little silly → the **lowest affective filter** and the **highest
  replay** of the three voices (Krashen: compelling input is input freely taken; Ebi
  Kani-kus's 100M views is the proof of concept for a learn-along).

### Where it fits best — the animals cut
The **animals variation is the natural first home** for P3: animals + call-and-response +
a hand gesture + a kids chorus = an Ebi-Kani-kus-style **dance-along**. And our animals
songs literally contain **かに (crab)** and **えび (shrimp)** — the exact Ebi-Kani-kus
creatures. Start P3 there (`01-aiueo-doubutsu`, `02-kakikukeko-doubutsu`).

### Suno approach — UNTESTED, and the robust route
Pure child-solo vocals in Suno are unreliable. The **robust** route is also the
**authentic** one: a **bright, youthful lead + a children's chorus answering** — which is
the おかあさんといっしょ format. Keep every existing rule (F-02 phonetic swaps in the Suno
doc, count-in, refrain-last = now the kids chorus). Recommended style prompt:

> `Japanese children's song (kodomo no uta), 104 BPM, bright cheerful youthful female`
> `lead with a children's chorus answering, glockenspiel, xylophone, marimba, toy piano,`
> `ukulele, hand claps, woodblock, bouncy upright bass, simple happy drums, playful and`
> `joyful, extremely clear enunciation of every kana, call-and-response, no ad-libs`

This kids style is wired into the two **animals** songs' `song.json` `styles[]` (COPY
STYLE on their dashboard cards) as the thing to try first.

### Test it, then log it
Run the **recognition test** from `house-style.md` before adopting P3 as a persona: does a
kids take of `01-aiueo-doubutsu` come out clear, joyful, and singable, with the chorus on
the refrain surviving? Log the result to `findings.md` (the next free slot, F-14): the
exact prompt, whether the kids chorus held, the tempo that worked, and whether Suno kept
enunciation clean at kid energy.

---

## Open questions (Nepô's call)
- Is **P2 (male koto)** a full Persona, or just an arrangement of P1? Decide after the
  recognition test.
- **Strategy A vs B first?** A (theme-paired) ships variety now with what we have; B
  (per-voice playlists) is the bigger, later swing once P3 is proven.
- Could **Nepô be a fourth voice** (Suno "Create a voice")? Parked in `house-style.md`;
  still attractive for permanence.

## Sources
- [Design Ah! — The Kid Should See This](https://thekidshouldseethis.com/post/design-ah-kids-counting-song-design-mind) · [Cornelius «デザインあ» soundtrack — RateYourMusic](https://rateyourmusic.com/release/album/cornelius/nhk%E3%80%8C%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%81%82%E3%80%8D)
- [Children's Songs in Japan — Nippon.com](https://www.nippon.com/en/japan-glances/jg00125/children%E2%80%99s-songs-in-japan.html) · [Warabe uta — Wikipedia](https://en.wikipedia.org/wiki/Warabe_uta) · [Genres of Japanese Children's Music — Mama Lisa](https://www.mamalisa.com/blog/genres-of-japanese-childrens-music/)
- [エビカニクス — Wikipedia](https://ja.wikipedia.org/wiki/%E3%82%A8%E3%83%93%E3%82%AB%E3%83%8B%E3%82%AF%E3%82%B9) · [ケロポンズ interview — sukusuku](https://www.sukusuku.com/contents/198808) · [だんご3兄弟 — Wikipedia](https://ja.wikipedia.org/wiki/%E3%81%A0%E3%82%93%E3%81%943%E5%85%84%E5%BC%9F)
