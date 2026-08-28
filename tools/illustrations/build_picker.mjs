#!/usr/bin/env node
// build_picker.mjs — generate illustrations.html, the picker page for choosing an
// Irasutoya file per word. Step 2 of the curated workflow:
//
//   1. scaffold.mjs --all         -> word lists (learning/<id>/illustrations.json)
//   2. build_picker.mjs           -> illustrations.html   (THIS)
//   3. you fill each filename on the page, hit "Copy picks", paste the JSON to me
//   4. apply.mjs <picks.json>     -> writes src back into the manifests
//   5. fetch.mjs <manifest>       -> copies the art into video/public
//
// The page is static (works on GitHub Pages): it reads nothing at runtime, saves
// your typing to localStorage so nothing is lost, and the Copy buttons emit
//   { "<id>": { "<romaji>": "<filename>", ... }, ... }
// for only the fields you filled. Designed to be AUTO-POPULATED later: a future
// step can pre-fill each input's value with a semantic-search suggestion.
//
//   node tools/illustrations/build_picker.mjs

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LEARNING = join(REPO, "learning");
const MAX = 18;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Collect every song that has an illustrations.json, newest-first by id.
const songs = [];
for (const name of readdirSync(LEARNING).sort()) {
  const ilPath = join(LEARNING, name, "illustrations.json");
  const cfgPath = join(LEARNING, name, "song.json");
  if (!existsSync(ilPath) || !existsSync(cfgPath)) continue;
  const il = JSON.parse(readFileSync(ilPath, "utf8"));
  const song = JSON.parse(readFileSync(cfgPath, "utf8"));
  songs.push({
    id: name,
    title: song.title || name,
    row: song.render?.row || "",
    status: song.status || "",
    items: il.items || [],
  });
}

const CSS = `:root{
  --ground:#0b1226;--surface:#14203c;--surface-2:#1a2747;--ink:#eef2fb;--ink-2:#a4b3d3;--ink-3:#6f7ea3;
  --rule:#26345a;--rule-soft:#1a2748;--shu:#ff5c48;--shu-ink:#ff8574;--ok:#3ad29f;--warn:#ffb020;
  --f-display:"Shippori Mincho B1",'Hiragino Mincho ProN','Yu Mincho',serif;
  --f-body:"Zen Maru Gothic",'Hiragino Maru Gothic ProN',system-ui,-apple-system,sans-serif;
  --f-jp:"Klee One",'Hiragino Mincho ProN',serif;
  --f-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--f-body);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px 120px}
.back{display:inline-block;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);text-decoration:none;padding:26px 0 0}
.back:hover{color:var(--shu-ink)}
.eyebrow{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--shu);margin:22px 0 14px}
h1{font-family:var(--f-display);font-weight:800;font-size:clamp(2rem,5vw,3rem);letter-spacing:-.015em;margin:0 0 8px}
.h1-jp{font-family:var(--f-jp);font-weight:600;color:var(--shu);letter-spacing:.14em;margin:0 0 18px}
.standfirst{font-size:1rem;color:var(--ink-2);max-width:70ch;margin:0 0 6px}
.standfirst code{font-family:var(--f-mono);font-size:.85em;color:var(--shu-ink)}
/* sticky toolbar */
.bar{position:sticky;top:0;z-index:5;background:rgba(11,18,38,.86);backdrop-filter:blur(8px);border-bottom:1px solid var(--rule);
  display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:14px 0;margin:22px 0 30px}
.bar input.filter{flex:1;min-width:180px;background:var(--surface);border:1px solid var(--rule);border-radius:3px;color:var(--ink);
  font-family:var(--f-body);font-size:14px;padding:8px 12px}
.bar input.filter:focus{outline:none;border-color:var(--shu)}
.btn{font-family:var(--f-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:8px 13px;border-radius:3px;
  border:1px solid var(--rule);background:var(--surface);color:var(--ink-2);cursor:pointer;white-space:nowrap}
.btn:hover{border-color:var(--shu);color:var(--shu-ink)}
.btn.primary{background:var(--shu);border-color:var(--shu);color:#fff}
.btn.primary:hover{color:#fff;opacity:.92}
.btn.done{border-color:var(--ok);color:var(--ok)}
label.chk{font-family:var(--f-mono);font-size:11px;letter-spacing:.05em;color:var(--ink-3);display:flex;gap:6px;align-items:center;cursor:pointer}
.counts{font-family:var(--f-mono);font-size:11px;color:var(--ink-3);margin-left:auto}
.counts b{color:var(--shu-ink)}
/* song block */
.song{border:1px solid var(--rule);border-radius:5px;margin:0 0 16px;background:var(--surface);overflow:hidden}
.song.hide{display:none}
.song > summary{list-style:none;cursor:pointer;padding:14px 18px;display:flex;gap:14px;align-items:baseline;flex-wrap:wrap;
  background:var(--surface-2);border-bottom:1px solid transparent}
.song[open] > summary{border-bottom-color:var(--rule)}
.song > summary::-webkit-details-marker{display:none}
.song .name{font-family:var(--f-jp);font-weight:600;font-size:1.12rem;color:var(--ink)}
.song .sid{font-family:var(--f-mono);font-size:10.5px;color:var(--ink-3);letter-spacing:.04em}
.pill{font-family:var(--f-mono);font-size:10px;letter-spacing:.05em;padding:3px 9px;border-radius:20px;border:1px solid var(--rule);color:var(--ink-3)}
.pill.full{border-color:var(--ok);color:var(--ok)}
.pill.over{border-color:var(--shu);color:var(--shu-ink)}
.song .sactions{margin-left:auto;display:flex;gap:8px}
.grid{padding:8px 18px 18px}
.row{display:grid;grid-template-columns:150px 1fr;gap:14px;align-items:center;padding:11px 0;border-top:1px solid var(--rule-soft)}
.row:first-child{border-top:none}
.wk{display:flex;flex-direction:column;gap:3px}
.wk .kana-line{display:flex;align-items:center;gap:8px}
.wk .kana{font-family:var(--f-jp);font-size:1.25rem;color:var(--ink);line-height:1.1}
.wk .rm{font-family:var(--f-mono);font-size:10px;color:var(--ink-3)}
.cw{font-family:var(--f-mono);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);background:none;
  border:1px solid var(--rule);border-radius:3px;padding:2px 6px;cursor:pointer;line-height:1.4;flex:none}
.cw:hover{border-color:var(--shu);color:var(--shu-ink)}
.cw.done{border-color:var(--ok);color:var(--ok)}
.meta{display:flex;flex-direction:column;gap:5px;min-width:0}
.meta .mline{font-size:.9rem;color:var(--ink-2)}
.meta .mline .cue{color:var(--shu-ink)}
.meta .mline .s{font-family:var(--f-jp);color:var(--ink-3);margin-left:8px}
.fn{display:flex;gap:8px;align-items:center}
.fn input{flex:1;min-width:0;background:var(--ground);border:1px solid var(--rule);border-radius:3px;color:var(--ink);
  font-family:var(--f-mono);font-size:12.5px;padding:7px 10px}
.fn input:focus{outline:none;border-color:var(--shu)}
.fn input.set{border-color:var(--ok)}
.dot{width:8px;height:8px;border-radius:50%;background:var(--rule);flex:none}
.dot.set{background:var(--ok)}
.prev{flex:none;width:42px;height:42px;border:1px solid var(--rule);border-radius:4px;background:var(--surface-2);
  display:flex;align-items:center;justify-content:center;overflow:hidden;text-decoration:none;position:relative}
.prev img{max-width:100%;max-height:100%;display:none}
.prev.ok{border-color:var(--ok);background:#fff}
.prev.ok img{display:block}
.prev::after{content:"—";color:var(--ink-3);font-family:var(--f-mono);font-size:12px}
.prev.ok::after,.prev.err::after{content:""}
.prev.err{border-color:var(--shu);border-style:dashed}
.prev.err::before{content:"?";color:var(--shu-ink);font-family:var(--f-mono);font-size:13px}
footer{margin-top:28px;padding-top:22px;border-top:1px solid var(--rule);font-family:var(--f-mono);font-size:11px;color:var(--ink-3);display:flex;flex-wrap:wrap;gap:8px 18px}
.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);background:var(--ok);color:#04140d;
  font-family:var(--f-mono);font-size:12px;letter-spacing:.04em;padding:10px 18px;border-radius:5px;opacity:0;pointer-events:none;transition:.22s}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
@media(max-width:640px){.row{grid-template-columns:1fr}}`;

function songBlock(s) {
  const rows = s.items.map((it) => {
    const val = esc(it.src || "");
    const setCls = it.src ? " set" : "";
    return `<div class="row" data-r="${esc(it.r)}">
      <div class="wk">
        <div class="kana-line"><span class="kana">${esc(it.w)}</span><button class="cw" data-w="${esc(it.w)}" title="copy ${esc(it.w)} to search">copy</button></div>
        <span class="rm">${esc(it.r)}.png</span>
      </div>
      <div class="meta">
        <div class="mline">${esc(it.m)}<span class="cue"> · ${esc(it.cue || it.m)}</span><span class="s">${esc(it.s || "")}</span></div>
        <div class="fn">
          <span class="dot${setCls}"></span>
          <input type="text" spellcheck="false" autocapitalize="off" autocomplete="off"
                 placeholder="paste Irasutoya filename, e.g. animal_wani.png"
                 data-id="${esc(s.id)}" data-r="${esc(it.r)}" value="${val}">
          <a class="prev" target="_blank" rel="noopener" title="open the full image in a new tab"><img alt="" loading="lazy"></a>
        </div>
      </div>
    </div>`;
  }).join("\n");

  return `<details class="song" data-id="${esc(s.id)}" data-name="${esc(s.title)}">
    <summary>
      <span class="name">${esc(s.title)}</span>
      <span class="sid">${esc(s.id)}</span>
      <span class="pill count">0/${s.items.length}</span>
      <span class="sactions">
        <button class="btn copy-song" data-id="${esc(s.id)}">Copy picks</button>
        <button class="btn reset-song" data-id="${esc(s.id)}">Reset</button>
      </span>
    </summary>
    <div class="grid">${rows}</div>
  </details>`;
}

const totalWords = songs.reduce((n, s) => n + s.items.length, 0);

const html = `<!doctype html>
<meta charset="utf-8">
<title>Illustration picker</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@600;700;800&family=Zen+Maru+Gothic:wght@400;500;700&family=Klee+One:wght@400;600&display=swap">
<style>${CSS}</style>
<div class="wrap">
<a class="back" href="index.html">&larr; Song dashboard</a>
<div class="eyebrow">Illustrations / Picker</div>
<h1>Illustration picker</h1>
<p class="h1-jp">いらすとや えらび</p>
<p class="standfirst">One Irasutoya illustration per word. Search the catalog (<code>irasutoya.mee.cc</code> or the query CLI), then paste the winning <code>filename.png</code> next to each word. Your typing is saved in this browser as you go. When a song is done, hit <b>Copy picks</b> and send me the blob — I run <code>apply.mjs</code> to write them in, then <code>fetch.mjs</code> pulls the art.</p>
<p class="standfirst" style="margin-top:8px">Cap: <b>18 distinct files per song</b> (Irasutoya limit) — the pill turns red if you go over. Reuse a filename across words to stay under.</p>

<div class="bar">
  <input class="filter" type="text" placeholder="filter songs by name or id…">
  <label class="chk"><input type="checkbox" class="only-unfilled"> only unfinished</label>
  <button class="btn primary copy-all">Copy ALL picks</button>
  <button class="btn expand">Expand all</button>
  <span class="counts"><b class="c-words">0</b> filled / ${totalWords} words · <b class="c-songs">0</b>/${songs.length} songs done</span>
</div>

${songs.map(songBlock).join("\n")}

<footer><span>illustration picker</span><span>generated from illustrations.json via build_picker.mjs</span><span>${songs.length} songs · ${totalWords} words</span></footer>
</div>
<div class="toast" id="toast"></div>
<script>
const MAX=${MAX};
// Preview sources. REMOTE first (the catalog's Cloudflare R2 origin, same one the
// irasutoya.mee.cc fansite uses) so previews work on the deployed Pages site AND
// avoid any file:// parent-folder blocking locally. LOCAL sibling catalog is the
// offline fallback. "Open full" points at the hi-res webp, which always resolves.
const IL_REMOTE="https://img.encyclopedias.cc/";     // <stem>.webp thumb, /hi/<stem>.webp full
const IL_LOCAL="../../Irasutoya/images/";            // sibling catalog (offline)
const stemOf=(v)=>v.replace(/\\.[^.]+$/,"").replace(/%/g,"%25");
const K=(id,r)=>"il:"+id+":"+r;
const toast=(m)=>{const t=document.getElementById("toast");t.textContent=m;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),1600)};
function lsGet(k){try{return localStorage.getItem(k)}catch(_){return null}}
function lsSet(k,v){try{v?localStorage.setItem(k,v):localStorage.removeItem(k)}catch(_){}}

// Live preview: try the remote thumb, then the local catalog, then mark ?.
function updatePreview(inp){
  const a=inp.parentElement.querySelector('.prev');if(!a)return;
  const img=a.querySelector('img');const v=inp.value.trim();
  a.classList.remove('ok','err');
  if(!v){a.removeAttribute('href');img.removeAttribute('src');img._stage=undefined;return}
  const stem=stemOf(v);
  const remote=IL_REMOTE+stem+".webp";
  const local=IL_LOCAL+encodeURIComponent(v);
  a.href=IL_REMOTE+"hi/"+stem+".webp";   // open the hi-res in a new tab
  img._stage=0;
  img.onload=()=>{a.classList.add('ok');a.classList.remove('err')};
  img.onerror=()=>{
    if(img._stage===0){img._stage=1;img.src=local;}   // remote miss -> try local catalog
    else{a.classList.remove('ok');a.classList.add('err');}
  };
  img.src=remote;
}

// Hydrate inputs from localStorage (in-progress edits win over the baked-in src).
document.querySelectorAll('input[data-r]').forEach(inp=>{
  const saved=lsGet(K(inp.dataset.id,inp.dataset.r));
  if(saved!==null) inp.value=saved;
  updatePreview(inp);
});

function refreshSong(det){
  const inputs=[...det.querySelectorAll('input[data-r]')];
  const vals=inputs.map(i=>i.value.trim()).filter(Boolean);
  const distinct=new Set(vals).size;
  inputs.forEach(i=>{const set=!!i.value.trim();i.classList.toggle('set',set);
    i.closest('.row').querySelector('.dot').classList.toggle('set',set)});
  const pill=det.querySelector('.count');
  pill.textContent=vals.length+"/"+inputs.length;
  pill.classList.toggle('full',vals.length===inputs.length && distinct<=MAX);
  pill.classList.toggle('over',distinct>MAX);
  if(distinct>MAX) pill.textContent=vals.length+"/"+inputs.length+" · "+distinct+">"+MAX+"!";
  return {filled:vals.length,total:inputs.length,done:vals.length===inputs.length};
}
function refreshAll(){
  let words=0,songsDone=0;
  document.querySelectorAll('.song').forEach(det=>{const r=refreshSong(det);words+=r.filled;if(r.done)songsDone++});
  document.querySelector('.c-words').textContent=words;
  document.querySelector('.c-songs').textContent=songsDone;
}

document.addEventListener('input',e=>{
  const inp=e.target.closest('input[data-r]');if(!inp)return;
  lsSet(K(inp.dataset.id,inp.dataset.r),inp.value.trim());
  refreshSong(inp.closest('.song'));
  updatePreview(inp);
  // light global recount
  let words=0,done=0;document.querySelectorAll('.song').forEach(d=>{const inps=[...d.querySelectorAll('input[data-r]')];const v=inps.map(i=>i.value.trim()).filter(Boolean);words+=v.length;if(v.length===inps.length)done++});
  document.querySelector('.c-words').textContent=words;document.querySelector('.c-songs').textContent=done;
});

function picksFor(id){
  const o={};
  document.querySelector('.song[data-id="'+CSS.escape(id)+'"]').querySelectorAll('input[data-r]').forEach(i=>{
    const v=i.value.trim();if(v)o[i.dataset.r]=v;
  });
  return o;
}
function copy(text,msg){
  const done=()=>toast(msg);
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done).catch(()=>fb(text,done));
  else fb(text,done);
}
function fb(text,done){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(_){}document.body.removeChild(ta);done()}

document.addEventListener('click',e=>{
  const cw=e.target.closest('.cw');
  if(cw){copy(cw.dataset.w, 'copied '+cw.dataset.w);
    cw.classList.add('done');clearTimeout(cw._h);cw._h=setTimeout(()=>cw.classList.remove('done'),1200);return}
  const cs=e.target.closest('.copy-song');
  if(cs){const id=cs.dataset.id;const p=picksFor(id);const n=Object.keys(p).length;
    if(!n){toast('no filenames yet for '+id);return}
    copy(JSON.stringify({[id]:p},null,2), 'copied '+n+' pick(s) for '+id);return}
  const rs=e.target.closest('.reset-song');
  if(rs){const det=rs.closest('.song');if(!confirm('Clear your unsaved filenames for '+rs.dataset.id+'?'))return;
    det.querySelectorAll('input[data-r]').forEach(i=>{lsSet(K(i.dataset.id,i.dataset.r),'');i.value=i.defaultValue;updatePreview(i)});refreshAll();return}
  if(e.target.closest('.copy-all')){
    const all={};document.querySelectorAll('.song').forEach(det=>{const id=det.dataset.id;const p=picksFor(id);if(Object.keys(p).length)all[id]=p});
    const n=Object.keys(all).length;if(!n){toast('nothing filled yet');return}
    copy(JSON.stringify(all,null,2), 'copied picks for '+n+' song(s)');return}
  if(e.target.closest('.expand')){const dets=[...document.querySelectorAll('.song')];const anyClosed=dets.some(d=>!d.open);dets.forEach(d=>d.open=anyClosed);e.target.closest('.expand').textContent=anyClosed?'Collapse all':'Expand all';return}
});

// filter + only-unfinished
function applyFilter(){
  const q=document.querySelector('.filter').value.trim().toLowerCase();
  const unf=document.querySelector('.only-unfilled').checked;
  document.querySelectorAll('.song').forEach(det=>{
    const hay=(det.dataset.id+' '+det.dataset.name).toLowerCase();
    const inps=[...det.querySelectorAll('input[data-r]')];
    const done=inps.every(i=>i.value.trim());
    let show=hay.includes(q);
    if(unf&&done)show=false;
    det.classList.toggle('hide',!show);
  });
}
document.querySelector('.filter').addEventListener('input',applyFilter);
document.querySelector('.only-unfilled').addEventListener('change',applyFilter);

refreshAll();
</script>
`;

const outPath = join(REPO, "illustrations.html");
writeFileSync(outPath, html);
console.log(`built illustrations.html — ${songs.length} songs, ${totalWords} words`);
