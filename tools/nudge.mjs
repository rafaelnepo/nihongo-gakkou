#!/usr/bin/env node
// nudge.mjs — apply tiny timing nudges to a learning-video timing JSON without
// hand-editing it. The base sync comes from tools/align (WhisperX); this is the
// fine-tune pass for the few lines that drift against the vocal.
//
//   node tools/nudge.mjs <id> --list                 # indexed line table (find the index)
//   node tools/nudge.mjs <id> --line 6 --by +0.15    # line 6 comes 0.15s LATER (accumulates)
//   node tools/nudge.mjs <id> --line 6 --by -0.1     # ...earlier
//   node tools/nudge.mjs <id> --line 6 --set 0.2     # set line 6's delay exactly
//   node tools/nudge.mjs <id> --line 6 --clear       # remove line 6's delay
//   node tools/nudge.mjs <id> --lines 36-41 --by -0.1  # nudge a span (e.g. the bridge)
//   node tools/nudge.mjs <id> --offset +0.1          # whole-song offset (accumulates)
//   node tools/nudge.mjs <id> --offset-set 0.1
//   node tools/nudge.mjs <id> --offset-clear
//
// Convention (matches types.ts): + = LATER, - = earlier — for both `delay` and
// `offsetSeconds`. `delay` shifts a line's in/out AND its whole karaoke fill
// together; it never touches the generated `chars[]`. Studio hot-reloads on save.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EPS = 1e-6;
const round3 = (n) => Math.round(n * 1000) / 1000;

// ---- args ------------------------------------------------------------------
const argv = process.argv.slice(2);
if (!argv.length || argv.includes("-h") || argv.includes("--help")) {
  console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 21).join("\n").replace(/^\/\/ ?/gm, ""));
  process.exit(0);
}
const id = argv[0];
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? (argv[i + 1] ?? "") : undefined;
};
const has = (name) => argv.includes(name);

// ---- locate the timing file ------------------------------------------------
const candidates = [
  resolve(REPO, `video/timing/${id}.learning.json`),
  resolve(REPO, `video/timing/${id}.json`),
];
const file = candidates.find(existsSync);
if (!file) {
  console.error(`No timing JSON for "${id}". Tried:\n  ${candidates.join("\n  ")}`);
  process.exit(1);
}
const doc = JSON.parse(readFileSync(file, "utf8"));
const lines = doc.lines ?? [];

// ---- --list ----------------------------------------------------------------
const table = () => {
  console.log(`${id}  ·  ${lines.length} lines  ·  offsetSeconds: ${doc.offsetSeconds ?? 0}\n`);
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    const span = `${L.start.toFixed(2)}-${L.end.toFixed(2)}`;
    const d = L.delay ? `  Δ${L.delay > 0 ? "+" : ""}${L.delay}` : "";
    console.log(`${String(i).padStart(2)}  ${span.padStart(13)}  ${(L.section ?? "").padEnd(7)} ${L.text}${d}`);
  }
};
if (has("--list")) {
  table();
  process.exit(0);
}

// ---- resolve target lines --------------------------------------------------
let targets = [];
if (flag("--line") !== undefined) targets = [Number(flag("--line"))];
else if (flag("--lines") !== undefined) {
  const [a, b] = flag("--lines").split("-").map(Number);
  for (let i = a; i <= b; i++) targets.push(i);
}
const isOffsetOp = has("--offset") || has("--offset-set") || has("--offset-clear");

if (!targets.length && !isOffsetOp) {
  console.error("Nothing to do. Use --list, --line N, --lines A-B, or --offset. (-h for help)");
  process.exit(1);
}
for (const i of targets) {
  if (!Number.isInteger(i) || i < 0 || i >= lines.length) {
    console.error(`Line index ${i} out of range (0..${lines.length - 1}).`);
    process.exit(1);
  }
}

const changes = [];

// ---- per-line delay --------------------------------------------------------
for (const i of targets) {
  const L = lines[i];
  const before = L.delay ?? 0;
  let after = before;
  if (has("--clear")) after = 0;
  else if (flag("--set") !== undefined) after = Number(flag("--set"));
  else if (flag("--by") !== undefined) after = before + Number(flag("--by"));
  else {
    console.error("Line target needs one of: --by <±s>, --set <s>, --clear.");
    process.exit(1);
  }
  after = round3(after);
  if (Math.abs(after) < EPS) delete L.delay;
  else L.delay = after;
  if (after !== before) changes.push(`line ${i} "${L.text}"  delay ${before} → ${L.delay ?? 0}`);
}

// ---- whole-song offset -----------------------------------------------------
if (isOffsetOp) {
  const before = doc.offsetSeconds ?? 0;
  let after = before;
  if (has("--offset-clear")) after = 0;
  else if (flag("--offset-set") !== undefined) after = Number(flag("--offset-set"));
  else if (flag("--offset") !== undefined) after = before + Number(flag("--offset"));
  after = round3(after);
  if (Math.abs(after) < EPS) delete doc.offsetSeconds;
  else doc.offsetSeconds = after;
  if (after !== before) changes.push(`offsetSeconds  ${before} → ${doc.offsetSeconds ?? 0}`);
}

// ---- write -----------------------------------------------------------------
if (!changes.length) {
  console.log("No change.");
  process.exit(0);
}
writeFileSync(file, JSON.stringify(doc, null, 2) + "\n");
console.log("Updated " + file.replace(REPO + "/", "") + ":");
for (const c of changes) console.log("  " + c);
