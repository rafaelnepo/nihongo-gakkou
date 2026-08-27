#!/usr/bin/env node
// credits.mjs — write a paste-ready illustration credit block for a song's
// video description (Irasutoya attribution + the list of what's shown).
//
//   node tools/illustrations/credits.mjs learning/01-aiueo/illustrations.json
//
// Writes <song>/illustration-credits.txt next to the manifest. Irasutoya's terms
// ask for attribution; this lists every illustration used (by the word it shows)
// under one © line, and reports the unique count against the 18/video cap.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifestPath = resolve(REPO, process.argv[2] || "");
const m = JSON.parse(readFileSync(manifestPath, "utf8"));

const used = m.items.filter((it) => it.src);
const unique = new Set(used.map((it) => it.src));

const lines = used.map((it) => `  ${it.w} (${it.r}) — ${it.m}`).join("\n");

const out = `▶ Illustrations in this video
Illustrations by Irasutoya (いらすとや) — https://www.irasutoya.com
${unique.size} illustration${unique.size === 1 ? "" : "s"} used${unique.size === used.length ? "" : ` (${used.length} words, some sharing art)`}:
${lines}
`;

const dest = resolve(dirname(manifestPath), "illustration-credits.txt");
writeFileSync(dest, out);
console.log(out);
console.log(`-> ${dest.replace(REPO + "/", "")}  (${unique.size}/18 unique)`);
