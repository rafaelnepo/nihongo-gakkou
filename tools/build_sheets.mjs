#!/usr/bin/env node
// build_sheets.mjs — generate a per-song HTML sheet from song.json + the song's
// .txt files. The .md/.txt stay the source of truth; the sheet is the output.
//
//   node songs/tools/build_sheets.mjs [path/to/song-folder]
//
// With no argument, builds every folder under learning/ personal/ yuba/ that
// contains a song.json. Lyrics are pulled live from the referenced suno-*.txt
// (the [tag] block onward), so re-running keeps the sheet in sync with the score.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SONGS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Pull the singable lyric out of a suno-*.txt: everything from the first [tag].
function extractLyrics(txt) {
  const lines = txt.replace(/\r/g, "").split("\n");
  const i = lines.findIndex((l) => /^\s*\[/.test(l));
  return (i >= 0 ? lines.slice(i).join("\n") : txt).trim();
}

// Light highlight for the <pre>: [tags], # comments, and the ワ/オ/エ particle
// fixes (which only ever appear as fixes here, the rest being hiragana).
function hlLyrics(txt) {
  return esc(txt)
    .replace(/^(#.*)$/gm, '<span class="cmt">$1</span>')
    .replace(/^(\[.*\])$/gm, '<span class="tag">$1</span>')
    .replace(/([ワオエ])/g, '<span class="mark">$1</span>');
}

const CSS = `:root{
  --ground:#f2f4f0;--surface:#fbfcfa;--surface-2:#e9ede8;
  --ink:#1a2320;--ink-2:#556158;--ink-3:#7d8a81;
  --rule:#c6d4c8;--rule-soft:#dde5dc;--green:#4a7a5e;--green-deep:#2e5540;
  --shu:#bc4630;--shu-ink:#a03a26;--shu-soft:#f2e0da;
  --shadow:0 1px 2px rgba(26,35,32,.05),0 8px 24px -16px rgba(26,35,32,.28);
  --f-display:"Shippori Mincho B1",'Hiragino Mincho ProN','Yu Mincho',serif;
  --f-body:"Zen Maru Gothic",'Hiragino Maru Gothic ProN',system-ui,-apple-system,sans-serif;
  --f-jp:"Klee One",'Hiragino Mincho ProN',serif;
  --f-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --ground:#121715;--surface:#1a201d;--surface-2:#222926;--ink:#e7ede8;--ink-2:#a3b0a7;--ink-3:#7d8a82;
  --rule:#313d36;--rule-soft:#262e2a;--green:#7fb493;--green-deep:#a5d2b5;
  --shu:#e57d63;--shu-ink:#f09077;--shu-soft:#39231d;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 10px 28px -18px rgba(0,0,0,.8);}}
:root[data-theme="dark"]{--ground:#121715;--surface:#1a201d;--surface-2:#222926;--ink:#e7ede8;--ink-2:#a3b0a7;--ink-3:#7d8a82;--rule:#313d36;--rule-soft:#262e2a;--green:#7fb493;--green-deep:#a5d2b5;--shu:#e57d63;--shu-ink:#f09077;--shu-soft:#39231d;--shadow:0 1px 2px rgba(0,0,0,.3),0 10px 28px -18px rgba(0,0,0,.8);}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--f-body);font-size:16.5px;line-height:1.7;-webkit-font-smoothing:antialiased}
.wrap{max-width:1000px;margin:0 auto;padding:0 24px 90px}
.back{display:inline-block;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);text-decoration:none;padding:26px 0 0}
.back:hover{color:var(--green-deep)}
.mast{padding:22px 0 30px;border-bottom:1px solid var(--rule);margin-bottom:44px}
.eyebrow{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--green);display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:18px}
.eyebrow span:not(:last-child)::after{content:"／";margin-left:10px;color:var(--rule)}
h1{font-family:var(--f-display);font-weight:800;font-size:clamp(2.1rem,5.6vw,3.4rem);line-height:1.06;letter-spacing:-.015em;margin:0 0 6px}
.h1-jp{font-family:var(--f-jp);font-weight:600;font-size:clamp(.98rem,2.5vw,1.22rem);color:var(--shu);letter-spacing:.14em;margin:0 0 18px}
.tags{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 18px}
.tag{font-family:var(--f-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;border-radius:2px;border:1px solid var(--rule);color:var(--ink-3)}
.tag.strand{color:var(--green-deep);border-color:var(--green)}
.tag.hot{color:#fff;background:var(--shu);border-color:var(--shu)}
.tag.priv{color:var(--shu-ink);border-color:var(--shu);border-style:dashed}
.standfirst{font-size:1.04rem;color:var(--ink-2);max-width:62ch;margin:0}
.meta{font-family:var(--f-mono);font-size:10.5px;color:var(--ink-3);letter-spacing:.04em;display:flex;flex-wrap:wrap;gap:5px 16px;margin:16px 0 0}
section{margin:0 0 54px}
.sec-head{display:flex;align-items:baseline;gap:14px;margin-bottom:8px;flex-wrap:wrap}
.sec-mark{font-family:var(--f-mono);font-size:11px;letter-spacing:.14em;color:var(--shu);border:1px solid var(--rule);border-radius:2px;padding:2px 7px}
h2{font-family:var(--f-display);font-weight:700;font-size:clamp(1.34rem,3vw,1.7rem);line-height:1.22;margin:0}
.sec-sub{color:var(--ink-3);margin:0 0 24px;max-width:64ch;font-size:.94rem}
p{margin:0 0 16px}
strong{font-weight:700}em{font-style:normal;color:var(--shu-ink);font-weight:500}
.paste{background:var(--surface);border:1px solid var(--rule);border-radius:3px;overflow:hidden;margin:0 0 16px;box-shadow:var(--shadow)}
.paste-head{padding:9px 12px 9px 15px;border-bottom:1px solid var(--rule);background:var(--surface-2);display:flex;justify-content:space-between;align-items:center;gap:10px}
.paste-head .t{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-2)}
.paste-head .t .rec{color:var(--shu);margin-left:6px}
.copy{font-family:var(--f-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:5px 11px;border-radius:2px;border:1px solid var(--rule);background:var(--surface);color:var(--ink-2);cursor:pointer;white-space:nowrap}
.copy:hover{border-color:var(--green);color:var(--green-deep)}
.copy.done{color:var(--green-deep);border-color:var(--green)}
@media (prefers-reduced-motion:no-preference){.copy{transition:border-color .15s,color .15s}}
.paste pre{margin:0;padding:15px 15px;font-family:var(--f-mono);font-size:12.5px;line-height:1.85;color:var(--ink-2);overflow-x:auto;white-space:pre-wrap;max-height:560px}
.paste pre .tag{color:var(--green)}
.paste pre .mark{color:var(--shu);font-weight:600}
.paste pre .cmt{color:var(--ink-3)}
.paste.style pre{font-family:var(--f-body);font-size:13.5px;line-height:1.6;color:var(--ink)}
/* vocab table */
.vgroup{margin:0 0 22px}
.vgroup .vh{font-family:var(--f-jp);font-weight:600;font-size:1.2rem;color:var(--green-deep);display:flex;align-items:baseline;gap:12px;margin:0 0 6px}
.vgroup .vh small{font-family:var(--f-mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:400}
.vtab{width:100%;border-collapse:collapse}
.vtab td{padding:9px 14px 9px 0;border-top:1px solid var(--rule-soft);vertical-align:baseline}
.vtab .w{font-family:var(--f-jp);font-size:1.1rem;color:var(--ink);white-space:nowrap}
.vtab .r{font-family:var(--f-mono);font-size:10px;color:var(--ink-3);white-space:nowrap}
.vtab .m{font-size:.86rem;color:var(--ink-2)}
.vtab .arrow{color:var(--shu);font-family:var(--f-mono);font-size:11px}
.vtab .s{font-family:var(--f-jp);font-size:1.02rem;color:var(--ink)}
.vtab .sm{font-size:.8rem;color:var(--ink-3)}
footer{margin-top:20px;padding-top:24px;border-top:1px solid var(--rule);font-family:var(--f-mono);font-size:11px;letter-spacing:.06em;color:var(--ink-3);display:flex;flex-wrap:wrap;gap:8px 20px}
@media (max-width:640px){.vtab td{display:block;padding:2px 0;border:none}.vgroup{border-top:1px solid var(--rule-soft);padding-top:12px}.vtab tr{display:block;padding:10px 0;border-top:1px solid var(--rule-soft)}}
:focus-visible{outline:2px solid var(--shu);outline-offset:3px;border-radius:2px}`;

const COPY_JS = `
document.querySelectorAll('.copy').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const pre=btn.closest('.paste').querySelector('pre');
    const text=pre.innerText;
    const done=()=>{const o=btn.textContent;btn.textContent='Copied \\u2713';btn.classList.add('done');setTimeout(()=>{btn.textContent=o;btn.classList.remove('done')},1400)};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(done).catch(()=>fb(text,done))}else fb(text,done);
  });
});
function fb(text,done){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(_){}document.body.removeChild(ta)}
`;

function buildSheet(song, folder) {
  const statusHot = song.status === "generated" || song.status === "video";
  const eyebrow = (song.eyebrow || ["Songs"]).map((s) => `<span>${esc(s)}</span>`).join("");
  const tags = [
    `<span class="tag strand">${esc(song.strand)}</span>`,
    `<span class="tag ${statusHot ? "hot" : ""}">${esc(song.status)}</span>`,
    song.private ? `<span class="tag priv">Private</span>` : "",
  ].join("");
  const meta = (song.meta || []).map((m) => `<span>${esc(m)}</span>`).join("");

  const concept = (song.concept || [])
    .map((p) => `<p>${p}</p>`) // concept may contain simple inline <b>/<em>
    .join("\n");

  // Style prompts
  const styles = (song.styles || [])
    .map(
      (st) => `
    <div class="paste style">
      <div class="paste-head"><span class="t">${esc(st.label)}${st.rec ? ' <span class="rec">★ house</span>' : ""}</span><button class="copy">Copy</button></div>
      <pre>${esc(st.text)}</pre>
    </div>`
    )
    .join("\n");

  // Lyrics — pulled from the referenced .txt files
  const lyrics = (song.lyrics || [])
    .map((ly) => {
      const p = join(folder, ly.file);
      if (!existsSync(p)) return `<!-- missing ${esc(ly.file)} -->`;
      const body = hlLyrics(extractLyrics(readFileSync(p, "utf8")));
      return `
    <div class="paste">
      <div class="paste-head"><span class="t">${esc(ly.label)}${ly.note ? ` &middot; ${esc(ly.note)}` : ""}</span><button class="copy">Copy</button></div>
      <pre>${body}</pre>
    </div>`;
    })
    .join("\n");

  // Vocab table
  const vocab = (song.vocab || [])
    .map((g) => {
      const rows = g.items
        .map(
          (it) => `<tr>
        <td class="w">${esc(it.w)}</td><td class="r">${esc(it.r)}</td><td class="m">${esc(it.m)}</td>
        <td class="arrow">&rarr;</td><td class="s">${esc(it.s)}</td><td class="sm">${esc(it.sm)}</td></tr>`
        )
        .join("\n");
      return `<div class="vgroup"><div class="vh">${esc(g.vowel)} <small>${esc(g.theme || "")}</small></div>
      <table class="vtab"><tbody>${rows}</tbody></table></div>`;
    })
    .join("\n");

  const extras = (song.extras || [])
    .map((ex) => {
      const p = join(folder, ex.file);
      if (!existsSync(p)) return "";
      const body = hlLyrics(readFileSync(p, "utf8").trim());
      return `
    <div class="paste">
      <div class="paste-head"><span class="t">${esc(ex.label)}</span><button class="copy">Copy</button></div>
      <pre>${body}</pre>
    </div>`;
    })
    .join("\n");

  return `<!doctype html>
<meta charset="utf-8">
<title>${esc(song.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@600;700;800&family=Zen+Maru+Gothic:wght@400;500;700&family=Klee+One:wght@400;600&display=swap">
<style>${CSS}</style>
<div class="wrap">
<a class="back" href="../../index.html">&larr; All songs</a>
<header class="mast">
  <div class="eyebrow">${eyebrow}</div>
  <h1>${esc(song.title)}</h1>
  <p class="h1-jp">${esc(song.jp)}</p>
  <div class="tags">${tags}</div>
  <p class="standfirst">${song.blurb}</p>
  ${meta ? `<div class="meta">${meta}</div>` : ""}
</header>
${concept ? `<section><div class="sec-head"><span class="sec-mark">01</span><h2>The idea</h2></div>${concept}</section>` : ""}
${styles ? `<section><div class="sec-head"><span class="sec-mark">02</span><h2>Style prompts</h2></div><p class="sec-sub">Paste one into Suno's style box. Copy buttons at right.</p>${styles}</section>` : ""}
${lyrics ? `<section><div class="sec-head"><span class="sec-mark">03</span><h2>Lyrics &mdash; paste into Suno</h2></div><p class="sec-sub">Pulled live from the suno-*.txt scores. <span class="mark" style="font-family:var(--f-mono)">ワ/オ/エ</span> are the particle fixes (は/を/へ).</p>${lyrics}</section>` : ""}
${vocab ? `<section><div class="sec-head"><span class="sec-mark">04</span><h2>What it teaches</h2></div><p class="sec-sub">Say the word, then see it used. Target word &rarr; a sentence in context.</p>${vocab}</section>` : ""}
${extras ? `<section><div class="sec-head"><span class="sec-mark">05</span><h2>More</h2></div>${extras}</section>` : ""}
<footer><span>${esc(song.title)}</span><span>generated from song.json + *.txt</span><span>build_sheets.mjs</span></footer>
</div>
<script>${COPY_JS}</script>
`;
}

// ── run ────────────────────────────────────────────────────────────────
const stripHtml = (s) => String(s).replace(/<[^>]+>/g, "");

function findSongDirs() {
  const dirs = [];
  for (const strand of ["learning", "personal", "yuba"]) {
    const base = join(SONGS_DIR, strand);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base)) {
      const folder = join(base, name);
      if (statSync(folder).isDirectory() && existsSync(join(folder, "song.json"))) dirs.push(folder);
    }
  }
  return dirs;
}

// Inject the PUBLIC (non-private) song list into index.html between markers, so
// the dashboard always reflects the song.json files. Private songs are excluded
// from the committed/published dashboard on purpose (see README → Privacy).
function injectDashboard(songs) {
  const idxPath = join(SONGS_DIR, "index.html");
  if (!existsSync(idxPath)) { console.warn("no index.html — skipping dashboard"); return; }
  const rows = songs.map((s) => "    " + JSON.stringify(s)).join(",\n");
  const block = `/* @generated:start — from song.json via build_sheets.mjs; do not edit */\n${rows}\n    /* @generated:end */`;
  const src = readFileSync(idxPath, "utf8");
  const re = /\/\* @generated:start[\s\S]*?@generated:end \*\//;
  if (!re.test(src)) { console.warn("index.html has no @generated markers — skipping dashboard"); return; }
  writeFileSync(idxPath, src.replace(re, block));
  console.log(`dashboard: ${songs.length} public song(s) written to index.html`);
}

const allDirs = findSongDirs();
if (!allDirs.length) {
  console.log("No song.json found. Create one in a song folder (see learning/03-aiueo/song.json).");
  process.exit(0);
}
const arg = process.argv[2];
const targets = arg ? [resolve(arg)] : allDirs;

let built = 0, skipped = 0;
for (const folder of targets) {
  const cfgPath = join(folder, "song.json");
  if (!existsSync(cfgPath)) { console.warn("skip (no song.json):", folder); continue; }
  const song = JSON.parse(readFileSync(cfgPath, "utf8"));
  if (song.bespoke) { console.log("skip sheet (bespoke):", song.id); skipped++; continue; }
  writeFileSync(join(folder, "sheet.html"), buildSheet(song, folder));
  console.log("built", join(folder, "sheet.html").replace(SONGS_DIR + "/", ""));
  built++;
}

// Dashboard is built from ALL songs regardless of which sheets were regenerated.
const dash = [];
for (const folder of allDirs) {
  const song = JSON.parse(readFileSync(join(folder, "song.json"), "utf8"));
  if (song.private) continue; // never expose private songs in the dashboard
  const rel = folder.replace(SONGS_DIR + "/", "");
  dash.push({
    id: song.id, title: song.title, jp: song.jp, strand: song.strand, status: song.status,
    priv: false, meta: song.meta || [], blurb: stripHtml(song.blurb || ""),
    sheet: rel + "/sheet.html", folder: rel + "/",
    style: (song.styles && song.styles[0] && song.styles[0].text) || "",
  });
}
injectDashboard(dash);
console.log(`\n${built} sheet(s) generated, ${skipped} bespoke skipped.`);
