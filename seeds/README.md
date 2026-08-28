# seeds/ — Persona identity sources (these never ship)

Each file is a **seed track**: a short, single-voice Suno generation whose only job is to
create a reusable **Persona**. The seed carries the **voice + that persona's signature
palette**; everything identity-confusing (a chorus, a second voice, register jumps) is
kept out and re-added per episode as arrangement. Full rationale: [`../personas.md`](../personas.md)
→ "The seed plan"; method: [`../house-style.md`](../house-style.md).

| Seed | Persona to save | Signature palette | Status |
|---|---|---|---|
| [`female-seed.txt`](female-seed.txt) | **Iconotes — Female** (P1) | city pop | ready to run |
| [`male-seed.txt`](male-seed.txt) | **Iconotes — Male** (P2) | koto × modern | ready to run |
| [`kids-seed.txt`](kids-seed.txt) | **Iconotes Kids** (P3) | toy-box (mallets + hand percussion) | voice validated (findings F-14) |

## The lyric — neutral, not a real song

**All three share the same neutral lyric** — a plain count (`いち に さん …`) and the gojūon
rows (`あ い う え お / か き く け こ / さ し す せ そ / た ち つ て と / な に ぬ ね の`).

**Why neutral, not one of our songs:** a Persona averages its source and carries melody/
phrasing forward. A real song would bake in its melody *and* its refrain-unison (a group
vocal = the mixed-identity we strip from seeds). A neutral lyric leaves only the voice. And
for *this* project the neutral choice is also perfectly on-domain: kana-reading is what the
series teaches, so the seed doubles as a **pure diction test** — every kana enunciated
clearly, our #1 vocal requirement. Same lyric across all three = the only variable is the
voice, so generating all three is a built-in **recognition test**.

**To nail a clean take:** keep it short (~20–40s is plenty); tag sections `[Verse]` only —
**never `[Chorus]`/`[Hook]`** (that's what recruits Suno's group-unison, the thing we're
avoiding); and keep the one-voice direction at the top. Don't stack identity controls.

**The loop:** run a seed once → save the Persona → then, for every real song, select the
Persona and add only what it doesn't carry (the chorus / call-and-response / tempo). Seed =
make-and-save the voice; episode = use the saved voice.
