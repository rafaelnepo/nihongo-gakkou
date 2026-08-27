#!/usr/bin/env node
// contact.mjs — build a visual contact sheet for a song's fetched illustrations,
// so the picks can be eyeballed and swapped before finalizing.
//
//   node tools/illustrations/contact.mjs learning/01-aiueo/illustrations.json
//
// Writes <dest>/_contact.html referencing the copied <r>.png files. Open it in a
// browser (video/public is served by the video project, or any static server).

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifestPath = resolve(REPO, process.argv[2] || "");
const m = JSON.parse(readFileSync(manifestPath, "utf8"));

const cards = m.items.map((it) => `
    <figure>
      <div class="pic"><img src="${it.r}.png" alt="${it.m}" loading="lazy"></div>
      <figcaption>
        <span class="kana">${it.w}</span>
        <span class="r">${it.r}</span>
        <span class="m">${it.m}</span>
        <span class="src">${it.src || "—"}</span>
      </figcaption>
    </figure>`).join("");

const html = `<!doctype html><meta charset="utf-8">
<title>${m.song} — illustration contact sheet</title>
<style>
  :root{ --navy:#0b1226; --panel:#14203c; --line:#26345a; --ink:#eef2fb; --muted:#a4b3d3; --red:#ff5c48; --cream:#faf3e3; }
  *{box-sizing:border-box} body{margin:0;background:var(--navy);color:var(--ink);
    font-family:"Zen Maru Gothic","Hiragino Maru Gothic ProN",system-ui,sans-serif;padding:32px}
  h1{font-size:20px;margin:0 0 4px} p.sub{margin:0 0 24px;color:var(--muted);font-size:13px}
  p.sub b{color:var(--red)}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}
  figure{margin:0;background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}
  .pic{aspect-ratio:1;background:var(--cream);display:grid;place-items:center;padding:14px}
  .pic img{max-width:100%;max-height:100%;object-fit:contain}
  figcaption{padding:10px 12px;display:grid;gap:2px}
  .kana{font-size:20px;font-weight:700}
  .r{font-size:11px;color:var(--red);letter-spacing:.05em;font-family:ui-monospace,monospace}
  .m{font-size:13px;color:var(--muted)}
  .src{font-size:10px;color:#6f7ea3;font-family:ui-monospace,monospace;margin-top:4px;word-break:break-all}
</style>
<h1>${m.song} — illustration contact sheet</h1>
<p class="sub">${m.items.length} words · illustrations by <b>Irasutoya</b> (いらすとや) · swap any pick by editing <b>illustrations.json</b> → re-run fetch</p>
<div class="grid">${cards}
</div>`;

const out = join(resolve(REPO, m.dest), "_contact.html");
writeFileSync(out, html);
console.log(`contact sheet -> ${m.dest}/_contact.html`);
