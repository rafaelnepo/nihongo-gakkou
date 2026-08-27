#!/usr/bin/env node
// fetch.mjs — copy the chosen Irasutoya illustrations for a song into video/public/.
//
// The illustrations live in the sibling Irasutoya catalog and are NOT committed to
// this repo (video/public/* is git-ignored). This script reads a song's
// illustrations.json manifest and copies each chosen `src` file to
// <dest>/<r>.png, so the video engine can load them by romaji name.
//
//   node tools/illustrations/fetch.mjs learning/01-aiueo/illustrations.json
//
// Re-run any time you change a `src` pick in the manifest. Missing sources are
// reported (so a bad filename fails loudly, not silently).
//
// Finding a `src`: use the sibling catalog's query CLI, e.g.
//   Irasutoya/venv/bin/python ../../Irasutoya/tools/pipeline/index/q.py \
//     find "犬の散歩のイラスト" --hybrid --limit 5

import { readFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const manifestArg = process.argv[2];
if (!manifestArg) {
  console.error("usage: node tools/illustrations/fetch.mjs <path/to/illustrations.json>");
  process.exit(1);
}

const manifestPath = resolve(REPO, manifestArg);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const manifestDir = dirname(manifestPath);

// srcRoot / dest are both resolved relative to the repo root, so `srcRoot`
// uses the same `../../Irasutoya/` convention as the README.
const srcRoot = resolve(REPO, manifest.srcRoot);
const dest = resolve(REPO, manifest.dest);

// Irasutoya usage cap: at most 18 DISTINCT illustrations per video. Repeats of
// the same file across the bands don't count — this is unique source files.
const MAX_ILLUSTRATIONS = 18;
const uniqueSrcs = new Set(manifest.items.filter((it) => it.src).map((it) => it.src));
if (uniqueSrcs.size > MAX_ILLUSTRATIONS) {
  console.error(
    `\n✗ ${uniqueSrcs.size} distinct illustrations — over the ${MAX_ILLUSTRATIONS}/video Irasutoya limit.\n` +
      `  Reuse a file across words, or drop one to a placeholder (src: null), then re-run.`
  );
  process.exit(3);
}

mkdirSync(dest, { recursive: true });

let ok = 0;
const missing = [];
for (const it of manifest.items) {
  if (!it.src) { missing.push(`${it.w} (${it.r}) — no src chosen`); continue; }
  const from = join(srcRoot, it.src);
  const to = join(dest, `${it.r}.png`);
  if (!existsSync(from)) { missing.push(`${it.w} (${it.r}) — src not found: ${it.src}`); continue; }
  copyFileSync(from, to);
  ok++;
  console.log(`  ${it.w.padEnd(5)} ${it.r.padEnd(9)} <- ${it.src}`);
}

console.log(`\n${ok}/${manifest.items.length} copied into ${manifest.dest}`);
console.log(`${uniqueSrcs.size}/${MAX_ILLUSTRATIONS} distinct illustrations (Irasutoya cap)`);
if (missing.length) {
  console.log(`\n${missing.length} missing / unresolved:`);
  for (const m of missing) console.log(`  - ${m}`);
  process.exit(2);
}
