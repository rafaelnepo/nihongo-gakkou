#!/usr/bin/env node
// build_learning_timing.mjs — emit / refresh a learning-video timing JSON for a song.
//
//   node tools/build_learning_timing.mjs 01-aiueo          # header refresh or scaffold
//   node tools/build_learning_timing.mjs 02-kakikukeko      # scaffold a new song
//   node tools/build_learning_timing.mjs 01-aiueo --force   # rebuild lines from source
//
// SINGLE SOURCE OF TRUTH: everything derives from the song's folder:
//   learning/<id>/song.json   -> `render` header block + `vocab[]` (the teach lines)
//   learning/<id>/screen.txt   -> the creative tail (BRIDGE + REVIEW + outro)
//   learning/<id>/audio/master.wav -> probed for the placeholder duration
//
// TEACH section (intro + one verse per vowel group + its refrain) is byte-exactly
// rebuilt from vocab[]. The BRIDGE/REVIEW/outro tail is parsed from screen.txt and
// scaffolded with default illustrations (marked for the author to confirm).
//
// MERGE-PRESERVING: if the timing file already exists and is ALIGNED
// (placeholder:false), the aligned `chars[]` + nudge fields (startShift/endShift/
// wordShifts/delay/offsetSeconds) are the real work — they are preserved and only
// the HEADER is refreshed from song.json. Pass --force to rebuild lines[] anyway
// (discards alignment — only for a song you are re-timing from scratch).
//
// The align pass (tools/align) later overwrites start/end and fills chars[] on a
// freshly-scaffolded (placeholder:true) file.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STRANDS = ["learning", "personal"];

const die = (msg) => { console.error(`build_learning_timing: ${msg}`); process.exit(1); };

const songDir = (id) => {
  for (const s of STRANDS) {
    const d = resolve(REPO, s, id);
    if (existsSync(d)) return d;
  }
  return die(`no source folder for "${id}" under ${STRANDS.join("/ or ")}/`);
};

const stripSpaces = (s) => s.replace(/\s+/g, "");

// Probe audio length (seconds) with ffprobe; fall back to a nominal 180s scaffold.
const probeDuration = (wav) => {
  try {
    const out = execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", wav,
    ], { encoding: "utf8" });
    const d = parseFloat(out.trim());
    return Number.isFinite(d) ? +d.toFixed(2) : null;
  } catch {
    return null;
  }
};

// ── Teach section from vocab[] (deterministic, byte-exact) ───────────────────
// vocab is an array of groups: { vowel, items: [{ w, r, m, s }, ...] }.
const teachLines = (vocab, row) => {
  const refrain = row.split("").join(" "); // "あいうえお" -> "あ い う え お"
  const lines = [];
  const groupIllos = vocab.map((g) => g.items.map((it) => it.r));

  // intro refrain, illustrated with the first group
  lines.push({ text: refrain, section: "intro", illos: groupIllos[0], kind: "refrain" });

  vocab.forEach((g, gi) => {
    const illos = groupIllos[gi];
    for (const it of g.items) {
      lines.push({ text: it.w, section: "verse", illos, target: it.r, kind: "word" });
      lines.push({ text: it.s, section: "verse", illos, target: it.r, kind: "sentence" });
    }
    lines.push({ text: refrain, section: "refrain", illos, kind: "refrain" });
  });

  return lines;
};

// Illustrations for a tail line = the vocab words actually sung in it. Tokens are
// whole words (optionally + a trailing particle, so むらさきの matches むらさき); a
// 1-kana word must match a token exactly, so て never matches inside たべて. Pairs
// come in longest-word-first so a full word beats a shorter prefix.
const TAIL_PARTICLES = new Set([
  "", "の", "を", "は", "が", "に", "へ", "と", "も", "で", "や", "か", "ね", "よ", "さ", "わ",
  "から", "には", "では", "でも", "まで", "より", "へは", "とは", "だ", "だよ",
]);
const illosForLine = (text, pairs) => {
  const toks = text.split(/[\s、。，,・！？!?「」『』…（）()]+/).filter(Boolean);
  const keys = [];
  for (const tok of toks) {
    for (const { w, r } of pairs) {
      if (tok === w || (w.length >= 2 && tok.startsWith(w) && TAIL_PARTICLES.has(tok.slice(w.length)))) {
        if (!keys.includes(r)) keys.push(r);
        break;
      }
    }
  }
  return keys;
};

// ── Creative tail from screen.txt (BRIDGE + REVIEW + outro) ──────────────────
// These lines are authored recombinations, not in vocab[]. We take their text and
// section from screen.txt, and illustrate each with the vocab words it sings
// (falling back to the first group for a pure refrain / no match).
const tailLines = (screenTxt, row, defaultIllos, vocabPairs) => {
  const refrain = row.split("").join(" ");
  const isRefrain = (t) => stripSpaces(t) === stripSpaces(row);
  const raw = screenTxt.split(/\r?\n/).map((l) => l.trim());

  const out = [];
  let region = null; // "bridge" | "review" | "done"
  let flagged = 0;
  for (const line of raw) {
    if (!line) continue;
    // Section markers are ONLY the decorated header rules (═══ … ═══), never prose
    // that happens to mention "BRIDGE"/"PART 2" (e.g. the "PART 1 + BRIDGE" note up top).
    const isHeader = /^═+/.test(line);
    if (isHeader && /BRIDGE/i.test(line)) { region = "bridge"; continue; }
    if (isHeader && /(PART\s*2|REVIEW)/i.test(line)) { region = "review"; continue; }
    if (isHeader) { region = "skip"; continue; }  // PART 1 / any other header: teach owns it
    if (/^\(outro\)/i.test(line)) {
      const t = line.replace(/^\(outro\)\s*/i, "").trim() || refrain;
      const m = illosForLine(t, vocabPairs);
      out.push({ text: t, section: "outro", illos: m.length ? m : defaultIllos, kind: "refrain" });
      region = "done";
      continue;
    }
    if (region === "done") break;               // ILLUSTRATION MAP etc. after outro
    if (region === null || region === "skip") continue; // header / intro / PART 1 → vocab handles
    if (/^─/.test(line)) continue;                // decorative rules
    if (/^\(intro\)/i.test(line)) continue;

    const section = isRefrain(line) ? "refrain" : region;
    const matched = illosForLine(line, vocabPairs);
    const l = { text: line, section, illos: matched.length ? matched : defaultIllos, kind: isRefrain(line) ? "refrain" : "sentence" };
    if (!isRefrain(line) && matched.length === 0) flagged++; // a sung line we couldn't auto-illustrate
    out.push(l);
  }
  return { lines: out, flagged };
};

// ── Placeholder timing distribution (align pass refines) ─────────────────────
const weightOf = (l) => (l.kind === "sentence" ? 1.5 : l.kind === "refrain" ? 1.2 : 1.0);

const distribute = (LINES, duration, countIn, tail) => {
  const totalW = LINES.reduce((s, l) => s + weightOf(l), 0);
  const span = duration - countIn - tail;
  let t = countIn;
  return LINES.map((l) => {
    const dur = (weightOf(l) / totalW) * span;
    const line = {
      text: l.text, start: +t.toFixed(2), end: +(t + dur * 0.92).toFixed(2),
      section: l.section, illos: l.illos,
    };
    if (l.target) line.target = l.target;
    t += dur;
    return line;
  });
};

// ── Build the header from song.json.render (the single source of truth) ──────
const buildHeader = (id, song, duration) => {
  const r = song.render || {};
  const need = ["trackName", "trackNo", "row", "channel", "style", "bpm"];
  for (const k of need) if (r[k] === undefined) die(`song.json.render.${k} is required`);
  return {
    song: id,
    title: song.title,
    trackName: r.trackName,
    trackNo: r.trackNo,
    row: r.row,
    channel: r.channel,
    style: r.style,
    bpm: r.bpm,
    ilBase: `${id}/il`,
    fps: r.fps ?? 30,
    width: r.width ?? 1920,
    height: r.height ?? 1080,
    audio: `${id}/audio.wav`,
    countInSeconds: r.countInSeconds ?? 1.1,
    tailSeconds: r.tailSeconds ?? 1.5,
    ...(duration ? { durationSeconds: duration } : {}),
  };
};

const main = () => {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const id = args.find((a) => !a.startsWith("--"));
  if (!id) die("usage: node tools/build_learning_timing.mjs <id> [--force]");

  const dir = songDir(id);
  const song = JSON.parse(readFileSync(resolve(dir, "song.json"), "utf8"));
  const row = song.render?.row ?? die("song.json.render.row is required");
  const wav = resolve(dir, "audio", "master.wav");
  const duration = existsSync(wav) ? probeDuration(wav) : null;

  const header = buildHeader(id, song, duration);
  const outPath = resolve(REPO, "video/timing", `${id}.learning.json`);
  const exists = existsSync(outPath);
  const prior = exists ? JSON.parse(readFileSync(outPath, "utf8")) : null;

  // MERGE-PRESERVE: aligned file, no --force -> keep everything (lines, chars[],
  // nudge fields, align provenance like `_aligned`, global offsetSeconds) and only
  // overlay the SSOT-owned header fields regenerated from song.json.
  if (prior && prior.placeholder === false && !force) {
    const merged = { ...prior, ...header, placeholder: false, lines: prior.lines };
    writeFileSync(outPath, JSON.stringify(merged, null, 2) + "\n");
    console.log(`refreshed header for ${id} (aligned lines preserved). Use --force to rebuild lines.`);
    return;
  }

  // Fresh scaffold: teach (vocab) + tail (screen.txt).
  const screen = readFileSync(resolve(dir, "screen.txt"), "utf8");
  const groupIllos0 = song.vocab?.[0]?.items?.map((it) => it.r) ?? [];
  const vocabPairs = (song.vocab ?? [])
    .flatMap((g) => g.items ?? [])
    .filter((it) => it.w && it.r)
    .map((it) => ({ w: it.w, r: it.r }))
    .sort((a, b) => b.w.length - a.w.length);
  const teach = teachLines(song.vocab, row);
  const { lines: tail, flagged } = tailLines(screen, row, groupIllos0, vocabPairs);
  const LINES = [...teach, ...tail];

  const dur = duration ?? 180;
  const lines = distribute(LINES, dur, header.countInSeconds, header.tailSeconds);
  const timing = { ...header, placeholder: true, durationSeconds: dur, lines };
  writeFileSync(outPath, JSON.stringify(timing, null, 2) + "\n");
  console.log(
    `wrote ${lines.length} lines -> video/timing/${id}.learning.json ` +
    `(${dur}s, placeholder). ${flagged} tail line(s) need illos confirmed by hand.`
  );
};

main();
