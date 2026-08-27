#!/usr/bin/env node
// build_learning_timing.mjs — emit a PLACEHOLDER learning-video timing for a song.
//
//   node tools/build_learning_timing.mjs
//
// The learning video shows two lines at a time (current fills red, next waits in
// grey), illustrations orbiting the current verse, and corner metadata. This
// script writes video/timing/01-aiueo.learning.json with lines distributed evenly
// (weighted so sentences get more time) across the audio. It is a SCAFFOLD:
// tools/align (WhisperX) later overwrites each line's start/end and adds per-char
// `chars[]` from the real vocal. Text is screen form — all hiragana, no romaji.
//
// `illos` are romaji keys resolving to video/public/il/01-aiueo/<key>.png
// (see tools/illustrations). `target` marks the word being taught on that line.

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ---- the song's structure (from learning/01-aiueo/screen.txt) --------------
const REFRAIN = "あ い う え お";
const A = ["asa", "ame", "ao"], I = ["ie", "inu", "iku"], U = ["umi", "uta", "usagi"];
const E = ["eki", "enpitsu", "en"], O = ["onigiri", "ocha", "okane"];

// a verse: word → sentence for each of its 3 words, then the row refrain
const verse = (illos, rows) => [
  ...rows.flatMap(([word, sentence, target]) => [
    { text: word, section: "verse", illos, target, kind: "word" },
    { text: sentence, section: "verse", illos, target, kind: "sentence" },
  ]),
  { text: REFRAIN, section: "refrain", illos, kind: "refrain" },
];

const LINES = [
  { text: REFRAIN, section: "intro", illos: [...A], kind: "refrain" },

  ...verse(A, [
    ["あさ", "おはよう", "asa"],
    ["あめ", "あさ から あめ", "ame"],
    ["あお", "あめ の あと、そら は あおい", "ao"],
  ]),
  ...verse(I, [
    ["いえ", "ただいま", "ie"],
    ["いぬ", "いえ に いぬ が いる", "inu"],
    ["いく", "いぬ と さんぽ に いく", "iku"],
  ]),
  ...verse(U, [
    ["うみ", "うみ へ いく", "umi"],
    ["うた", "うた を うたう", "uta"],
    ["うさぎ", "うさぎ が いる", "usagi"],
  ]),
  ...verse(E, [
    ["えき", "えき へ いく", "eki"],
    ["えんぴつ", "えんぴつ を かう", "enpitsu"],
    ["えん", "えんぴつ は ひゃくえん", "en"],
  ]),
  ...verse(O, [
    ["おにぎり", "おにぎり を たべる", "onigiri"],
    ["おちゃ", "おちゃ を のむ", "ocha"],
    ["おかね", "おかね を はらう", "okane"],
  ]),

  // bridge — "the day": the words recombine into one little scene
  { text: "おはよう、あさ だよ", section: "bridge", illos: [...A], kind: "sentence" },
  { text: "あめ の あと、そら は あおい", section: "bridge", illos: [...A], kind: "sentence" },
  { text: "いえ に かえって、いぬ と さんぽ", section: "bridge", illos: [...I], kind: "sentence" },
  { text: "うみ で うた を うたう", section: "bridge", illos: [...U], kind: "sentence" },
  { text: "えき で えんぴつ、ひゃくえん", section: "bridge", illos: [...E], kind: "sentence" },
  { text: "おにぎり と おちゃ", section: "bridge", illos: [...O], kind: "sentence" },
  { text: REFRAIN, section: "refrain", illos: [...A], kind: "refrain" },

  // review — sentences only, sing along
  ...[
    ["おはよう", A], ["あさ から あめ", A], ["あめ の あと、そら は あおい", A],
    ["ただいま", I], ["いえ に いぬ が いる", I], ["いぬ と さんぽ に いく", I],
    ["うみ へ いく", U], ["うた を うたう", U], ["うさぎ が いる", U],
    ["えき へ いく", E], ["えんぴつ を かう", E], ["ひゃくえん です", E],
    ["おにぎり を たべる", O], ["おちゃ を のむ", O], ["おかね を はらう", O],
  ].map(([text, illos]) => ({ text, section: "review", illos: [...illos], kind: "sentence" })),
  { text: REFRAIN, section: "outro", illos: [...A], kind: "refrain" },
];

// ---- distribute placeholder timings across the audio ------------------------
const DURATION = 179.47; // the 3-min city-pop cut (ffprobe); align pass refines
const COUNT_IN = 2.5;   // dots count-in before the first line
const TAIL = 1.5;
const weightOf = (l) => (l.kind === "sentence" ? 1.5 : l.kind === "refrain" ? 1.2 : 1.0);

const totalW = LINES.reduce((s, l) => s + weightOf(l), 0);
const span = DURATION - COUNT_IN - TAIL;
let t = COUNT_IN;
const lines = LINES.map((l) => {
  const dur = (weightOf(l) / totalW) * span;
  const line = { text: l.text, start: +t.toFixed(2), end: +(t + dur * 0.92).toFixed(2), section: l.section, illos: l.illos };
  if (l.target) line.target = l.target;
  t += dur;
  return line;
});

const timing = {
  song: "01-aiueo",
  title: "あいうえお",
  channel: "iconotes",
  style: "City Pop",
  bpm: 92,
  ilBase: "il/01-aiueo",
  fps: 30,
  width: 1920,
  height: 1080,
  audio: "01-aiueo.wav",
  placeholder: true,
  durationSeconds: DURATION,
  countInSeconds: COUNT_IN,
  tailSeconds: TAIL,
  lines,
};

const out = resolve(REPO, "video/timing/01-aiueo.learning.json");
writeFileSync(out, JSON.stringify(timing, null, 2) + "\n");
console.log(`wrote ${lines.length} lines -> video/timing/01-aiueo.learning.json (${DURATION}s, placeholder)`);
