#!/usr/bin/env node
// clean.mjs — keep video/out/ tidy: only per-song folders + a scratch _stills/.
//
//   node tools/clean.mjs            # sweep loose junk + empty _stills/
//   node tools/clean.mjs --dry      # show what would be removed, delete nothing
//
// Under the canonical-overwrite policy each render OVERWRITES its file in place, so
// old versions never pile up on their own. The only things that accumulate are:
//   1. loose files left directly in video/out/ (old flat masters, ad-hoc stills)
//   2. dev/QA frames dropped in video/out/_stills/
// This removes both. Per-song folders (video/out/<id>/) are left untouched — they
// only ever hold the canonical <id>-<kind> renders the pipeline writes.

import { readdirSync, statSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(REPO, "video/out");
const dry = process.argv.includes("--dry");

let removed = 0, bytes = 0;
const rm = (p, label) => {
  const size = statSync(p).size;
  console.log(`${dry ? "would remove" : "removed"}: ${label} (${(size / 1e6).toFixed(1)} MB)`);
  if (!dry) rmSync(p, { force: true });
  removed++; bytes += size;
};

let entries;
try { entries = readdirSync(OUT); }
catch { console.log("video/out/ does not exist — nothing to clean."); process.exit(0); }

for (const name of entries) {
  const p = join(OUT, name);
  const st = statSync(p);
  if (st.isDirectory()) {
    if (name === "_stills") {
      // scratch frames — always safe to empty
      for (const f of readdirSync(p)) rm(join(p, f), `_stills/${f}`);
    }
    // per-song folders (<id>/) are canonical — leave them
    continue;
  }
  // any loose FILE at the out/ root is scratch/legacy — remove it
  if (name === ".gitkeep") continue;
  rm(p, name);
}

console.log(`${dry ? "(dry) " : ""}${removed} file(s), ${(bytes / 1e6).toFixed(1)} MB`);
