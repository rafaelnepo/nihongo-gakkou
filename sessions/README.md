# sessions — start here each session

The routines live here; **what happened** lives in the dated files. Keeping the
running status in `sessions/` (not the main README) is what stops the README from
going monolithic.

## Entry point — a rule, so it can't go stale
The **newest dated file** in this folder (`sessions/YYYY-MM-DD.md`) and its
**"Next"** section is where to pick up.

---

## Session start
1. **`git pull`** — CI may have committed regenerated sheets while you were away.
2. Read the newest session log's **Next** section.
3. **Health check** (all should be green):
   - CI: `gh run list --workflow=build-sheets.yml --limit 1`
   - Live site: `curl -sI https://rafaelnepo.github.io/nihongo-gakkou/ | head -1` (expect `HTTP/2 200`)
4. About to work on a song? `../findings.md` before generating · `../house-style.md`
   before a style prompt · `../reference/comprehensible-input.md` for the *why*.
5. Remember: **`personal/` and `books/` are local-only** (git-ignored) — a fresh
   clone won't have them, and they must never be committed.

## Session close
1. **Write today's log** — `sessions/YYYY-MM-DD.md` (template below). End with a
   concrete **Next**.
2. Keep the main README **stable** — volatile status goes in the log, not the README.
3. If you touched a `song.json` or a lyric `.txt`, run
   `node ../tools/build_sheets.mjs` and eyeball the output (or let CI do it).
4. **Commit + push.** Confirm CI goes green and Pages updated.
5. **Privacy gut-check** — this must print nothing:
   ```
   git diff --cached --name-only | grep -iE 'personal/|books/|Satie|Yuuto|\.wav$|\.mp3$|\.mp4$'
   ```

---

## Log template
```
# YYYY-MM-DD — <one-line summary>

Previous: [YYYY-MM-DD](./YYYY-MM-DD.md)

## What happened
- ...

## Decisions
- ...

## State now
- ...

## Next (where to pick up)
1. ...
```

## Index
- [2026-08-27](./2026-08-27.md) — genesis: songs → Remotion engine → split out to its own repo, published.
