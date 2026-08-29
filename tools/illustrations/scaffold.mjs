#!/usr/bin/env node
// scaffold.mjs — generate/refresh a song's illustrations.json word-list from its
// song.json vocab[]. This is step 1 of the curated illustration workflow: it makes
// the LIST OF WORDS (up to 18) that need an Irasutoya picture. You then fill each
// `src` (the chosen catalog filename) via the picker page, apply.mjs writes them
// back here, and fetch.mjs copies the art.
//
//   node tools/illustrations/scaffold.mjs 02-kakikukeko-machi   # one song
//   node tools/illustrations/scaffold.mjs --all                 # every learning song
//
// MERGE-PRESERVING: if illustrations.json already exists, every item's chosen `src`
// and hand-tuned `cue` are KEPT; only w/r/m/s are refreshed from song.json and any
// new vocab words are appended (src:null). So re-running never loses a curated pick.
//
// The 18-distinct-illustrations Irasutoya cap is enforced later by fetch.mjs; this
// script just warns if a song's vocab already exceeds it.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LEARNING = join(REPO, "learning");
const MAX = 18;

const die = (m) => { console.error(`scaffold: ${m}`); process.exit(1); };

function scaffold(id) {
  const dir = join(LEARNING, id);
  const cfgPath = join(dir, "song.json");
  if (!existsSync(cfgPath)) return die(`no song.json for ${id}`);
  const song = JSON.parse(readFileSync(cfgPath, "utf8"));
  const vocab = song.vocab || [];
  if (!vocab.length) { console.log(`skip ${id} (no vocab)`); return; }

  // Existing picks to preserve, keyed by romaji.
  const outPath = join(dir, "illustrations.json");
  const prior = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : null;
  const priorByR = new Map((prior?.items || []).map((it) => [it.r, it]));

  const items = [];
  for (const g of vocab) {
    for (const it of g.items) {
      const was = priorByR.get(it.r);
      items.push({
        w: it.w,
        r: it.r,
        m: it.m,
        s: it.s,
        // cue: what to picture / a search hint. Seed from the meaning; keep any
        // hand-tuned cue from a prior manifest.
        cue: was?.cue ?? it.m,
        // src: the chosen Irasutoya filename. Preserve an existing pick; else null.
        src: was?.src ?? null,
      });
    }
  }

  const manifest = {
    song: id,
    note:
      "Word -> Irasutoya illustration map. Fill each `src` with a catalog filename " +
      "(picker page or manual search), then `node tools/illustrations/apply.mjs` / " +
      "`fetch.mjs`. Sources live in ../../Irasutoya/images/<src>; art is copied into " +
      "video/public (git-ignored) and credited to いらすとや in the description.",
    srcRoot: prior?.srcRoot ?? "../../Irasutoya/images",
    // Canonical source home for a song's art. sync.mjs copies learning/<id>/il/*.png
    // -> video/public/<id>/il/ (what the render's `ilBase: "<id>/il"` reads). Fetching
    // straight to video/public/il/<id> (the old layout) leaves it un-synced and unseen.
    dest: prior?.dest ?? `learning/${id}/il`,
    items,
  };

  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
  const filled = items.filter((i) => i.src).length;
  const flag = items.length > MAX ? `  ⚠ ${items.length} > ${MAX} cap` : "";
  console.log(`  ${id.padEnd(26)} ${items.length} words, ${filled} with src${flag}`);
}

const args = process.argv.slice(2);
let ids;
if (args.includes("--all")) {
  ids = readdirSync(LEARNING).filter((n) => {
    const s = join(LEARNING, n, "song.json");
    if (!existsSync(s)) return false;
    const song = JSON.parse(readFileSync(s, "utf8"));
    return (song.vocab || []).length > 0; // skip bespoke/no-vocab songs
  }).sort();
} else {
  ids = args.filter((a) => !a.startsWith("--"));
}
if (!ids.length) die("usage: scaffold.mjs <id> | --all");

console.log(`scaffolding ${ids.length} manifest(s):`);
for (const id of ids) scaffold(id);
console.log("\nnext: fill each src via the picker (build_picker.mjs) → apply.mjs → fetch.mjs");
