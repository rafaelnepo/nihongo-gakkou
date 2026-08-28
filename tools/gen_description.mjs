#!/usr/bin/env node
// gen_description.mjs — generate the publish-stage text for a song from song.json.
//
//   node tools/gen_description.mjs 01-aiueo
//
// Writes two files into the song's (gitignored) build/ folder:
//   build/description.txt — the YouTube description box (paste at publish)
//   build/vocab.md        — the "words being learned" table (word · romaji · meaning · sentence)
//
// Everything is derived from learning/<id>/song.json — the single source of truth.
// No hand-copying vocab into a description ever again.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STRANDS = ["learning", "personal"];

const die = (m) => { console.error(`gen_description: ${m}`); process.exit(1); };
const songDir = (id) => STRANDS.map((s) => resolve(REPO, s, id)).find(existsSync)
  || die(`no source folder for "${id}"`);

// song.json blurb/concept carry light HTML (<strong>, <em>, &amp;) for the web sheet.
const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };
const stripHtml = (s) =>
  s.replace(/<[^>]+>/g, "")
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (m) => ENTITIES[m])
    .replace(/\s+/g, " ")
    .trim();

const id = process.argv[2] || die("usage: node tools/gen_description.mjs <id>");
const dir = songDir(id);
const song = JSON.parse(readFileSync(resolve(dir, "song.json"), "utf8"));
const build = resolve(dir, "build");
mkdirSync(build, { recursive: true });

// ── description.txt ──────────────────────────────────────────────────────────
const groups = song.vocab || [];
const allWords = groups.flatMap((g) => g.items);

const wordLines = groups.flatMap((g) =>
  g.items.map((it) => `  ${it.w}  (${it.r}) — ${it.m}`)
);

const desc = [
  `${song.title}${song.jp ? "  ·  " + song.jp : ""}`,
  "",
  ...(song.blurb ? [stripHtml(song.blurb), ""] : []),
  ...(song.concept?.length ? [...song.concept.map(stripHtml), ""] : []),
  `── Words in this video (${allWords.length}) ──`,
  ...wordLines,
  "",
  ...(song.meta?.length ? [song.meta.join("  ·  "), ""] : []),
  `#Japanese #hiragana #にほんご #学習 #${(song.render?.row || "").replace(/\s/g, "")}`,
].join("\n");

writeFileSync(resolve(build, "description.txt"), desc + "\n");

// ── vocab.md ─────────────────────────────────────────────────────────────────
const md = [
  `# ${song.title} — words`,
  "",
  "| word | romaji | meaning | sentence | sentence meaning |",
  "| --- | --- | --- | --- | --- |",
  ...groups.flatMap((g) =>
    g.items.map((it) =>
      `| ${it.w} | ${it.r} | ${it.m} | ${it.s || ""} | ${it.sm || ""} |`
    )
  ),
  "",
].join("\n");

writeFileSync(resolve(build, "vocab.md"), md);

console.log(`wrote ${dir.replace(REPO + "/", "")}/build/description.txt + vocab.md (${allWords.length} words)`);
