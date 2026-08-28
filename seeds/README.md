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

**All three share the same neutral lyric** — a plain count (`いち に さん …`) and two kana
rows (`あ い う え お / か き く け こ / さ し す せ そ`). Nothing to lean on, so the *only*
variable between the three seeds is the voice and its style — which also makes generating
all three a built-in recognition test (do they come out as three distinct, clean voices?).

**The loop:** run a seed once → save the Persona → then, for every real song, select the
Persona and add only what it doesn't carry (the chorus / call-and-response / tempo). Seed =
make-and-save the voice; episode = use the saved voice.
