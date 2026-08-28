#!/usr/bin/env node
// sync.mjs — stage a song's render assets into video/public/<id>/ for Remotion.
//
//   node tools/sync.mjs 01-aiueo          # sync one song
//   node tools/sync.mjs --all             # sync every learning/ + personal/ song
//
// Remotion's staticFile() can only read from video/public/. The canonical homes
// for a song's audio and illustrations live in its source folder:
//
//   learning/<id>/audio/master.wav   ->  video/public/<id>/audio.wav
//   learning/<id>/il/<key>.png       ->  video/public/<id>/il/<key>.png
//
// Both sides are gitignored and regenerable, so the copy is intentional (it keeps
// each song folder self-contained). The timing JSON points at the public paths
// via `audio: "<id>/audio.wav"` and `ilBase: "<id>/il"`. Idempotent: a second run
// only copies files whose size/mtime changed.

import {
  copyFileSync, existsSync, mkdirSync, readdirSync, statSync, rmSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STRANDS = ["learning", "personal"];

// Locate a song's source folder across the strands (learning/ or personal/).
const sourceDir = (id) => {
  for (const strand of STRANDS) {
    const dir = resolve(REPO, strand, id);
    if (existsSync(dir)) return dir;
  }
  return null;
};

// Copy only when missing or changed (size or mtime), so re-runs are cheap no-ops.
const copyIfNewer = (src, dst) => {
  if (existsSync(dst)) {
    const a = statSync(src), b = statSync(dst);
    if (a.size === b.size && Math.floor(a.mtimeMs) <= Math.floor(b.mtimeMs)) {
      return false;
    }
  }
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
  return true;
};

const syncSong = (id) => {
  const src = sourceDir(id);
  if (!src) throw new Error(`No source folder for "${id}" under ${STRANDS.join("/ or ")}/`);

  const pub = resolve(REPO, "video/public", id);
  mkdirSync(pub, { recursive: true });
  let copied = 0;

  // audio: learning/<id>/audio/master.wav -> public/<id>/audio.wav
  const audioSrc = join(src, "audio", "master.wav");
  if (!existsSync(audioSrc)) {
    throw new Error(`Missing render take: ${audioSrc} (pick a Suno take and copy it here)`);
  }
  if (copyIfNewer(audioSrc, join(pub, "audio.wav"))) copied++;

  // illustrations: learning/<id>/il/*.png -> public/<id>/il/*.png
  const ilSrc = join(src, "il");
  const ilDst = join(pub, "il");
  if (existsSync(ilSrc)) {
    mkdirSync(ilDst, { recursive: true });
    for (const f of readdirSync(ilSrc)) {
      if (!f.endsWith(".png")) continue; // skip _contact.html and stray files
      if (copyIfNewer(join(ilSrc, f), join(ilDst, f))) copied++;
    }
  }

  console.log(`synced ${id}: ${copied} file(s) -> video/public/${id}/`);
};

const main = () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("usage: node tools/sync.mjs <id> | --all");
    process.exit(1);
  }
  let ids;
  if (args[0] === "--all") {
    ids = [];
    for (const strand of STRANDS) {
      const base = resolve(REPO, strand);
      if (!existsSync(base)) continue;
      for (const name of readdirSync(base)) {
        if (existsSync(join(base, name, "audio", "master.wav"))) ids.push(name);
      }
    }
  } else {
    ids = args;
  }
  for (const id of ids) syncSong(id);
};

main();
