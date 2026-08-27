# House style — how the set sounds like a set

**Opened 2026-08-27, after two episodes came out in two unrelated genres.**
This governs every future episode. Read it before writing a style prompt.

The question Nepô asked: *"If we're going to create a full set, we should really
nail down a style so that it comes out looking like it's all part of the same
set with same voices. How can we achieve that?"*

---

## The trap in the question

**Series identity is mostly FORMAT, not timbre.** A listener knows a podcast, a TV
show or a record label inside four seconds — and almost never because the voice is
identical. They know it from the shape: the same opening, the same pacing, the same
sign-off, the same recurring sound.

We already have most of that and have not been treating it as an asset:

| Locked | Where it lives |
|---|---|
| The 8-part song architecture | `README.md` |
| Tempo band 85–100 BPM (92 validated) | `findings.md` F-01 |
| Cold open → spoken tag bookend | architecture 00 / 07 |
| Two-document rule | `findings.md` F-02 |
| Japanese-only, no translation in the lyric | `README.md` |
| **Learning-song duration** (fixed so the series isn't all over the place — Nepô, 2026-08-27): **~1:00 vertical Stories/Reels cut · ~3:00 YouTube** (the long version is filled with contextual sentences, NOT a repeated loop — findings F-10) | `learning/01-aiueo/style.txt` |

**Two things are missing, and both are cheap.** Adding them will do more for
"this is a set" than any voice-locking feature:

1. **A sonic signature.** One sound that opens or closes every single episode —
   the door from あいさつ, a bell, a single struck instrument. Three seconds, same
   every time. This is the cheapest series-identity device that exists and we have
   not used it.
2. **A fixed sign-off.** The spoken tag already exists structurally but says
   something different each episode. Make one phrase constant across the series
   and it becomes the theme.

Do these first. They cost nothing and they survive every Suno model change.

---

## Then the voice half: Personas

**Personas are the right Suno feature for this** — a recurring generated project
identity, reusable across songs. Not "upload audio", not "add inspiration".

### What a Persona actually does

| It may carry over | It does NOT lock |
|---|---|
| Vocal character and delivery | One exact singer / identical timbre |
| Genre and stylistic tendency | Melody or arrangement |
| Instrumentation, sonic palette | Mix, pronunciation, vocal range |
| Energy, mood, production texture | Identical results across languages |
| Phrasing tendency | Identical behaviour after a model update |

A Persona makes a new song feel **related to** the source. It is not deterministic
voice cloning and should not be sold to ourselves as such.

### ⚠ The specific problem for THIS project

**Duets, choirs and register changes make poor Persona sources.** Mixed-identity
audio is documented as harder to reuse predictably — and *both* episodes so far
are call-and-response with two voices. **The thing that makes these songs
pedagogically good is exactly what makes them bad Persona seeds.**

### The workaround: build a seed track that is not an episode

Generate a short, deliberately **single-voice** track in the house style whose only
job is to be the identity source. It never ships. Then make the Persona from that,
and apply it to every real episode.

A good seed is: one voice, mid-range, unhurried, dry, no duet, no choir, no
register jumps, lyrics that are plain and emotionally neutral (the あいさつ clock
verse alone would do). Clean identity, nothing for the Persona to average.

### Applying it

1. Create → **Custom mode**
2. Pick the Persona from the Voices/identity selector
3. **Read the auto-filled style text** and delete anything that fights it
4. Add only the new production direction this episode needs

**Never stack identity controls.** Persona + Voice + uploaded audio + inspiration
+ My Taste all pull in different directions, and that is the fastest route to
drift. Pick one and let it work.

**Do not contradict the Persona in the style prompt.** Naming a second singer, an
unrelated genre, or an incompatible production brief will undo it.

### Verify before committing to a workflow

There is **conflicting public reporting** about whether Persona-from-song creation
is still offered, or whether it now requires uploading your own voice — and tier
availability is not documented reliably anywhere. **Check what your account
actually shows** before planning around it. Do not let this document be the reason
you believe a button exists.

---

## The other two options Nepô saw in the UI

- **Upload audio** — your own recording as reference or starting material. A
  different job: it seeds *material*, not identity.
- **Create a voice / Voice** — your own verified vocal identity, rights-gated.
  Worth naming as a real option: **Nepô could be the voice of the series.** For a
  personal learning project that is genuinely attractive — permanent consistency,
  no drift, no model-update risk, and it makes the set his. It is also a much
  bigger commitment than a Persona. Parked, not dismissed.
- **Add inspiration / style reference** — weaker and more transient than a
  Persona. Fine for one-off steering, wrong for series identity.

---

## The strategic fork, which is Nepô's call

Episode 1 is Shōwa kayōkyoku. Episode 2's recommended style is boom-bap hip hop.
**Those are not the same set**, and this is a direct consequence of two decisions
that were both good on their own: "nail down one style" and "restyle the
traditional chants in different genres" pull in opposite directions.

Three ways out:

1. **One house sound everywhere.** Maximum cohesion. Kills the restyle idea, which
   was the most interesting thing about the chant strand.
2. **Two strands, two house sounds.** Situational songs in one voice; chant
   restyles as the deliberate variations record. Each internally consistent, and
   the contrast becomes intentional rather than accidental.
3. **One voice, many arrangements.** ★ *Recommended.* Keep the **Persona constant**
   and let the **genre vary**. This is how a single artist's album can range widely
   and still be unmistakably them — and it is exactly what a Persona is built to
   do, since it carries vocal character across style changes better than it carries
   arrangement.

Option 3 is also the only one that does not require giving up something already
decided. The cost is drift risk at genre boundaries — mitigated by running the
**boundary test**: move one genre at a time, note what survives, stop where the
Persona stops being dependable.

---

## Before building a full set: three tests, one afternoon

From the Persona literature, and worth running before committing to twelve episodes:

1. **Recognition** — same Persona, restrained lyrics. Is the identity still there?
2. **Controlled variation** — hold Persona and lyrics, change exactly one variable.
3. **Boundary** — move to a neighbouring genre. Record where it breaks.

Log the full recipe each time: Persona name, model version, lyrics, style text,
what was excluded, what changed, what happened. That log belongs in `findings.md`.

## Sources
- [Suno Personas: Keep the Same Voice Across Songs — Jack Righteous](https://jackrighteous.com/en-us/blogs/guides-using-suno-ai-music-creation/suno-personas-keep-the-same-voice-across-songs)
- [Suno Personas Guide — SongSmith](https://songsmith.studio/blog/suno-personas-guide)
