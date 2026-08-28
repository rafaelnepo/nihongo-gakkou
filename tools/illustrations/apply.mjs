#!/usr/bin/env node
// apply.mjs — write chosen filenames from the picker back into the manifests.
// Step 4 of the curated workflow. Consumes the JSON the picker's "Copy picks"
// button produces:
//
//   { "<id>": { "<romaji>": "<filename.png>", ... }, ... }
//
// Usage — a file, or piped/pasted on stdin:
//   node tools/illustrations/apply.mjs picks.json
//   pbpaste | node tools/illustrations/apply.mjs -
//   node tools/illustrations/apply.mjs <<'JSON'
//   { "10-wawon-female": { "wani": "animal_wani.png" } }
//   JSON
//
// For each song it sets item.src for the matching romaji (only the keys present;
// existing picks are left alone), warns on unknown romaji, and flags any song that
// goes over the 18-distinct-file cap. Then run fetch.mjs to copy the art.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LEARNING = join(REPO, "learning");
const MAX = 18;

const die = (m) => { console.error(`apply: ${m}`); process.exit(1); };

function readInput() {
  const arg = process.argv[2];
  if (!arg || arg === "-") {
    try { return readFileSync(0, "utf8"); } catch { return die("no input on stdin (pass a file or pipe JSON)"); }
  }
  const p = resolve(REPO, arg);
  if (!existsSync(p)) return die(`file not found: ${arg}`);
  return readFileSync(p, "utf8");
}

let picks;
try { picks = JSON.parse(readInput()); }
catch (e) { die(`input is not valid JSON — ${e.message}`); }
if (!picks || typeof picks !== "object" || Array.isArray(picks)) die('expected { "<id>": { "<romaji>": "<file>" } }');

let songsTouched = 0, fieldsSet = 0;
const warnings = [];

for (const [id, map] of Object.entries(picks)) {
  const ilPath = join(LEARNING, id, "illustrations.json");
  if (!existsSync(ilPath)) { warnings.push(`unknown song "${id}" — no illustrations.json (run scaffold.mjs first)`); continue; }
  const manifest = JSON.parse(readFileSync(ilPath, "utf8"));
  const byR = new Map(manifest.items.map((it) => [it.r, it]));
  let set = 0;
  for (const [r, src] of Object.entries(map)) {
    const it = byR.get(r);
    if (!it) { warnings.push(`${id}: no word "${r}" in manifest — skipped`); continue; }
    const clean = String(src).trim();
    if (!clean) continue;
    it.src = clean;
    set++; fieldsSet++;
  }
  if (!set) continue;

  const distinct = new Set(manifest.items.filter((i) => i.src).map((i) => i.src)).size;
  if (distinct > MAX) warnings.push(`${id}: ${distinct} distinct files — OVER the ${MAX} cap (fetch will refuse; reuse a file or drop one)`);

  writeFileSync(ilPath, JSON.stringify(manifest, null, 2) + "\n");
  const filled = manifest.items.filter((i) => i.src).length;
  console.log(`  ${id.padEnd(26)} +${set} set  (${filled}/${manifest.items.length} total, ${distinct}/${MAX} distinct)`);
  songsTouched++;
}

console.log(`\napplied ${fieldsSet} filename(s) across ${songsTouched} song(s).`);
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); for (const w of warnings) console.log(`  ⚠ ${w}`); }
console.log(`\nnext: node tools/illustrations/fetch.mjs learning/<id>/illustrations.json   (copies the art)`);
