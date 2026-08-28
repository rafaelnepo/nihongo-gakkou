import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, type PlayerRef } from "@remotion/player";
import { LearningVideo } from "../src/LearningVideo";
import { learningDurationInFrames } from "../src/types";
import type { LearningTiming } from "../src/types";

const SONG_ID = "01-aiueo";
const STEPS = [0.02, 0.05, 0.1, 0.2]; // seconds per arrow tap
const PANE_PAD = 30; // left/right inset — title, video and shortcuts all start here

const fmt = (s: number) => {
  const sec = Math.max(0, s);
  const m = Math.floor(sec / 60);
  const r = (sec % 60).toFixed(2).padStart(5, "0");
  return `${m}:${r}`;
};
const signed = (n: number) => (n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2));

// Mirror LearningVideo's bakeLines(): each line's window after its nudges, then a
// forward cascade so a line never starts before the previous one ends. Returned
// per line as { s, e } — used for the read-outs, seeks and active-line highlight,
// so the GUI shows exactly what the player renders.
const bakeWindows = (lines: LearningTiming["lines"]) => {
  let floor = -Infinity;
  return lines.map((l) => {
    const d = l.delay ?? 0;
    const s = Math.max(l.start + d + (l.startShift ?? 0), floor);
    const e = Math.max(l.end + d + (l.endShift ?? 0), s + 1e-3);
    floor = e;
    return { s, e };
  });
};

type Line = LearningTiming["lines"][number];

// space-separated words, same split the template uses for wordShifts
const wordsOf = (text: string) => text.split(" ").filter((w) => w.length > 0);

// the contiguous run of same-section lines containing idx (a "block")
const blockRange = (lines: Line[], idx: number): [number, number] => {
  const sec = lines[idx].section;
  let a = idx;
  let b = idx;
  while (a > 0 && lines[a - 1].section === sec) a--;
  while (b < lines.length - 1 && lines[b + 1].section === sec) b++;
  return [a, b];
};

// drop trailing zeros so a cleared wordShifts array disappears from the JSON
const trimZeros = (arr: number[]): number[] | undefined => {
  let n = arr.length;
  while (n > 0 && !arr[n - 1]) n--;
  return n ? arr.slice(0, n) : undefined;
};

// approx time of a word's first glyph inside the line's baked window (for cueing)
const wordSeek = (line: Line, wi: number, win: { s: number; e: number }) => {
  const glyphs = Array.from(line.text);
  let w = -1;
  let prevSpace = true;
  let gi = 0;
  for (let i = 0; i < glyphs.length; i++) {
    const sp = glyphs[i] === " ";
    if (!sp && prevSpace) {
      w++;
      if (w === wi) {
        gi = i;
        break;
      }
    }
    prevSpace = sp;
  }
  const frac = glyphs.length ? gi / glyphs.length : 0;
  return win.s + frac * (win.e - win.s) + (line.wordShifts?.[wi] ?? 0);
};

// Each word's actual [start, end] in the baked timeline: original chars remapped
// into the line's window, plus its word shift — the same math the template uses,
// so the bars reflect exactly what renders. Used by the word-timeline view.
type WordSpan = { wi: number; start: number; end: number };
const wordSpans = (line: Line, win: { s: number; e: number }): WordSpan[] => {
  const glyphs = Array.from(line.text);
  const os = line.start;
  const oe = line.end;
  const span = Math.max(1e-6, oe - os);
  const remap = (x: number) => win.s + ((x - os) / span) * (win.e - win.s);
  const out: WordSpan[] = [];
  let w = -1;
  let prevSpace = true;
  glyphs.forEach((g, i) => {
    const sp = g === " ";
    if (!sp && prevSpace) {
      w++;
      out[w] = { wi: w, start: Infinity, end: -Infinity };
    }
    const c = line.chars?.[i];
    if (!sp && c) {
      const sh = line.wordShifts?.[w] ?? 0;
      out[w].start = Math.min(out[w].start, remap(c.start) + sh);
      out[w].end = Math.max(out[w].end, remap(c.end) + sh);
    }
    prevSpace = sp;
  });
  return out.filter((s) => Number.isFinite(s.start));
};

const App: React.FC = () => {
  const [timing, setTiming] = useState<LearningTiming | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [vertical, setVertical] = useState(false);
  const [step, setStep] = useState(0.05);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  useEffect(() => setSelectedWord(null), [selected]); // reset word pick per line
  const [leftW, setLeftW] = useState(() => {
    // width of the player pane (drag to resize) — remembered per browser
    try {
      const v = Number(localStorage.getItem("nudge.leftW"));
      if (v >= 320) return v;
    } catch {}
    return 560;
  });
  useEffect(() => {
    try {
      localStorage.setItem("nudge.leftW", String(leftW));
    } catch {}
  }, [leftW]);

  const playerRef = useRef<PlayerRef>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // When auditioning one line (R), pause once the playhead passes its end.
  const stopAtFrame = useRef<number | null>(null);
  const dragging = useRef(false);

  // ---- drag the divider to resize the player pane ---------------------------
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current) return;
      setLeftW(Math.max(320, Math.min(window.innerWidth - 360, e.clientX)));
    };
    const up = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);
  const startDrag = () => {
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // ---- load -----------------------------------------------------------------
  useEffect(() => {
    fetch(`/api/timing?id=${SONG_ID}`)
      .then((r) => (r.ok ? r.json() : r.json().then((j) => Promise.reject(j.error))))
      .then((j) => setTiming(j as LearningTiming))
      .catch((e) => setErr(String(e)));
  }, []);

  // ---- track the playhead to highlight the active line ----------------------
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    const on = (e: { detail: { frame: number } }) => {
      setFrame(e.detail.frame);
      if (stopAtFrame.current != null && e.detail.frame >= stopAtFrame.current) {
        stopAtFrame.current = null;
        p.pause();
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    p.addEventListener("frameupdate", on);
    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);
    return () => {
      p.removeEventListener("frameupdate", on);
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
    };
  }, [timing]);

  const fps = timing?.fps ?? 30;
  const offset = timing?.offsetSeconds ?? 0;
  const nowT = frame / fps - offset;

  // ---- persist (debounced) --------------------------------------------------
  const persist = useCallback((next: LearningTiming) => {
    setSave("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/timing?id=${SONG_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      })
        .then((r) => setSave(r.ok ? "saved" : "error"))
        .catch(() => setSave("error"));
    }, 350);
  }, []);

  const seekToT = useCallback(
    (tSec: number) => {
      stopAtFrame.current = null;
      const f = Math.round((tSec + offset) * fps);
      playerRef.current?.pause();
      playerRef.current?.seekTo(Math.max(0, f));
    },
    [fps, offset]
  );

  // ---- the one mutation: nudge a line's start or end ------------------------
  const nudge = useCallback(
    (idx: number, which: "start" | "end", dir: 1 | -1) => {
      setSelected(idx);
      setTiming((prev) => {
        if (!prev) return prev;
        const lines = prev.lines.map((l, k) => {
          if (k !== idx) return l;
          const key = which === "start" ? "startShift" : "endShift";
          const val = Math.round(((l[key] ?? 0) + dir * step) * 1000) / 1000;
          const copy = { ...l };
          if (Math.abs(val) < 1e-6) delete copy[key];
          else copy[key] = val;
          return copy;
        });
        const next = { ...prev, lines };
        persist(next);
        const w = bakeWindows(next.lines)[idx];
        seekToT(which === "start" ? w.s : Math.max(w.s, w.e - 0.4));
        return next;
      });
    },
    [step, persist, seekToT]
  );

  const reset = useCallback(
    (idx: number) => {
      setTiming((prev) => {
        if (!prev) return prev;
        const lines = prev.lines.map((l, k) => {
          if (k !== idx) return l;
          const copy = { ...l };
          delete copy.startShift;
          delete copy.endShift;
          delete copy.wordShifts;
          return copy;
        });
        const next = { ...prev, lines };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // BLOCK level: shift a whole section (every line in the selected line's run)
  // together, by bumping each line's `delay`.
  const nudgeBlock = useCallback(
    (dir: 1 | -1) => {
      if (selected == null) return;
      setTiming((prev) => {
        if (!prev) return prev;
        const [a, b] = blockRange(prev.lines, selected);
        const lines = prev.lines.map((l, k) => {
          if (k < a || k > b) return l;
          const val = Math.round(((l.delay ?? 0) + dir * step) * 1000) / 1000;
          const copy = { ...l };
          if (Math.abs(val) < 1e-6) delete copy.delay;
          else copy.delay = val;
          return copy;
        });
        const next = { ...prev, lines };
        persist(next);
        seekToT(bakeWindows(next.lines)[a].s);
        return next;
      });
    },
    [selected, step, persist, seekToT]
  );

  // WORD level: micro-shift one word inside the selected line.
  const nudgeWord = useCallback(
    (dir: 1 | -1) => {
      if (selected == null || selectedWord == null || !timing) return;
      const wi = selectedWord;
      // guard: only middle words are shiftable (edges == Line start/end)
      const wc = wordsOf(timing.lines[selected].text).length;
      if (wi <= 0 || wi >= wc - 1) return;
      setTiming((prev) => {
        if (!prev) return prev;
        const lines = prev.lines.map((l, k) => {
          if (k !== selected) return l;
          const arr = (l.wordShifts ?? []).slice();
          while (arr.length <= wi) arr.push(0);
          arr[wi] = Math.round(((arr[wi] ?? 0) + dir * step) * 1000) / 1000;
          const copy = { ...l };
          const trimmed = trimZeros(arr);
          if (trimmed) copy.wordShifts = trimmed;
          else delete copy.wordShifts;
          return copy;
        });
        const next = { ...prev, lines };
        persist(next);
        seekToT(wordSeek(next.lines[selected], wi, bakeWindows(next.lines)[selected]));
        return next;
      });
    },
    [selected, selectedWord, step, persist, seekToT, timing]
  );

  // Move the selection (clamped) and cue the player to that line's start.
  const selectLine = useCallback(
    (idx: number) => {
      setTiming((prev) => {
        if (!prev) return prev;
        const clamped = Math.max(0, Math.min(prev.lines.length - 1, idx));
        setSelected(clamped);
        seekToT(bakeWindows(prev.lines)[clamped].s);
        return prev;
      });
    },
    [seekToT]
  );

  // Audition: play the selected line from its start, auto-stopping at its end.
  const playLine = useCallback(
    (idx: number | null) => {
      if (idx == null || !timing) return;
      const w = bakeWindows(timing.lines)[idx];
      stopAtFrame.current = Math.round((w.e + offset) * fps) + Math.round(0.15 * fps);
      playerRef.current?.seekTo(Math.max(0, Math.round((w.s + offset) * fps)));
      playerRef.current?.play();
    },
    [timing, fps, offset]
  );

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    stopAtFrame.current = null;
    p.isPlaying() ? p.pause() : p.play();
  }, []);

  const seekFrame = useCallback((f: number) => {
    stopAtFrame.current = null;
    playerRef.current?.seekTo(Math.max(0, f));
  }, []);

  // ---- keyboard workflow ----------------------------------------------------
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const cur = selected;
      switch (e.key) {
        case "[":
        case "]": {
          const i = STEPS.indexOf(step);
          setStep(STEPS[e.key === "[" ? Math.max(0, i - 1) : Math.min(STEPS.length - 1, i + 1)]);
          return;
        }
        case "ArrowUp": // previous line
          e.preventDefault();
          selectLine(cur == null ? 0 : cur - 1);
          return;
        case "ArrowDown": // next line
          e.preventDefault();
          selectLine(cur == null ? 0 : cur + 1);
          return;
        case "ArrowLeft": // start (or end with Shift) earlier
          if (cur == null) return;
          e.preventDefault();
          nudge(cur, e.shiftKey ? "end" : "start", -1);
          return;
        case "ArrowRight": // start (or end with Shift) later
          if (cur == null) return;
          e.preventDefault();
          nudge(cur, e.shiftKey ? "end" : "start", 1);
          return;
        case "r":
        case "R": // replay current line
          e.preventDefault();
          playLine(cur);
          return;
        case " ": // play / pause
          e.preventDefault();
          togglePlay();
          return;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selected, step, nudge, selectLine, playLine, togglePlay]);

  const durationInFrames = useMemo(
    () => (timing ? learningDurationInFrames(timing) : 1),
    [timing]
  );
  const inputProps = useMemo(
    () => (timing ? { songId: SONG_ID, timingOverride: timing } : { songId: SONG_ID }),
    [timing]
  );
  // cascaded windows for display / highlight (same math the player renders)
  const windows = useMemo(() => (timing ? bakeWindows(timing.lines) : []), [timing]);

  if (err) return <div style={S.center}>Failed to load timing: {err}</div>;
  if (!timing) return <div style={S.center}>Loading {SONG_ID}…</div>;

  const compW = vertical ? 1080 : 1920;
  const compH = vertical ? 1920 : 1080;
  const previewW = Math.min(1100, leftW - 2 * PANE_PAD); // follows the pane width (drag)

  const activeIdx = windows.reduce((acc, w, k) => (nowT >= w.s ? k : acc), -1);

  return (
    <div style={S.app}>
      <header style={S.header}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>
          Iconotes Nudger <span style={{ color: "#cbc1ac" }}>·</span>{" "}
          <span style={{ color: "#e7481c" }}>{SONG_ID}</span>
        </div>
        <div style={S.spacer} />
        <label style={S.control}>
          step
          <select value={step} onChange={(e) => setStep(Number(e.target.value))} style={S.select}>
            {STEPS.map((s) => (
              <option key={s} value={s}>
                {s}s
              </option>
            ))}
          </select>
        </label>
        <button style={S.toggle} onClick={() => setVertical((v) => !v)}>
          {vertical ? "▯ vertical" : "▭ horizontal"}
        </button>
        <span style={{ ...S.badge, ...S.saveBadge[save] }}>{save}</span>
      </header>

      <div style={S.body}>
        {/* left — the live player */}
        <div style={{ ...S.left, width: leftW }}>
          <div style={{ width: previewW, maxWidth: "100%" }}>
            <Player
              ref={playerRef}
              component={LearningVideo as React.ComponentType<Record<string, unknown>>}
              inputProps={inputProps}
              durationInFrames={durationInFrames}
              compositionWidth={compW}
              compositionHeight={compH}
              fps={fps}
              style={{ width: previewW, maxWidth: "100%", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,0.18)" }}
              spaceKeyToPlayOrPause={false}
              acknowledgeRemotionLicense
            />

            {/* controls, UNDER the video (native overlay disabled above) */}
            <div style={S.controls}>
              <button style={S.playBtn} onClick={togglePlay} title="play / pause (Space)">
                {playing ? "❚❚" : "▶"}
              </button>
              <input
                type="range"
                min={0}
                max={Math.max(1, durationInFrames - 1)}
                value={Math.min(frame, durationInFrames - 1)}
                onChange={(e) => seekFrame(Number(e.target.value))}
                style={S.scrub}
              />
              <div style={S.time}>
                {fmt(frame / fps)} / {fmt(durationInFrames / fps)}
              </div>
            </div>

            <div style={S.playhead}>
              t = <b>{fmt(Math.max(0, nowT))}</b>
              {activeIdx >= 0 ? (
                <>
                  {" · line "}
                  <b>{activeIdx}</b> {timing.lines[activeIdx].text}
                </>
              ) : null}
            </div>
          </div>

          {/* shortcuts | nudge levels, below the video (full pane width) */}
          <div style={S.bottomPanels}>
            <div style={S.panel}>
              <div style={S.panelTitle}>Shortcuts</div>
              <div style={S.legend}>
                <Legend k={["←", "/", "→"]} d="start − / +" />
                <Legend k={["⇧", "+", "←", "/", "→"]} d="end − / +" />
                <Legend k={["↑", "/", "↓"]} d="prev / next line" />
                <Legend k={["R"]} d="replay current line" />
                <Legend k={["Space"]} d="play / pause" />
                <Legend k={["[", "/", "]"]} d="step size" />
              </div>
            </div>
            <div style={S.panelSep} />
            <div style={S.panel}>
              <div style={S.panelTitle}>Nudge levels</div>
              <LevelsPanel
                line={selected != null ? timing.lines[selected] : null}
                win={selected != null ? windows[selected] : null}
                selectedWord={selectedWord}
                onPickWord={setSelectedWord}
                onBlock={nudgeBlock}
                onLine={(which, dir) => selected != null && nudge(selected, which, dir)}
                onWord={nudgeWord}
              />
            </div>
          </div>
        </div>

        {/* draggable divider — widen the pane to enlarge the video */}
        <div
          style={S.divider}
          onMouseDown={(e) => {
            e.preventDefault(); // stop the browser starting a text selection
            startDrag();
          }}
          title="drag to resize"
        >
          <div style={S.dividerGrip} />
        </div>

        {/* right — the line list */}
        <div style={S.right}>
          {timing.lines.map((l, idx) => {
            const w = windows[idx];
            const ss = l.startShift ?? 0;
            const es = l.endShift ?? 0;
            const touched = ss !== 0 || es !== 0 || !!l.wordShifts?.some((x) => x);
            const isSel = selected === idx;
            const isActive = activeIdx === idx;
            const newSection = idx === 0 || timing.lines[idx - 1].section !== l.section;
            return (
              <React.Fragment key={idx}>
                {newSection ? (
                  <div style={S.section}>
                    <span style={S.sectionLabel}>{l.section}</span>
                    <span style={S.sectionRule} />
                  </div>
                ) : null}
                <div
                  onClick={() => {
                    setSelected(idx);
                    seekToT(w.s);
                  }}
                style={{
                  ...S.row,
                  ...(isSel ? S.rowSel : null),
                  ...(isActive ? S.rowActive : null),
                }}
              >
                <div style={S.idx}>{idx}</div>
                <div style={S.text}>
                  <div style={{ fontSize: 15 }}>{l.text}</div>
                  <div style={S.times}>
                    {fmt(w.s)} – {fmt(w.e)} · {l.section}
                  </div>
                </div>

                <Group
                  label="start"
                  value={ss}
                  onLeft={(e) => (e.stopPropagation(), nudge(idx, "start", -1))}
                  onRight={(e) => (e.stopPropagation(), nudge(idx, "start", 1))}
                />
                <Group
                  label="end"
                  value={es}
                  onLeft={(e) => (e.stopPropagation(), nudge(idx, "end", -1))}
                  onRight={(e) => (e.stopPropagation(), nudge(idx, "end", 1))}
                />

                <button
                  title="reset this line"
                  onClick={(e) => (e.stopPropagation(), reset(idx))}
                  style={{ ...S.reset, visibility: touched ? "visible" : "hidden" }}
                >
                  ⟲
                </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Group: React.FC<{
  label: string;
  value: number;
  onLeft: (e: React.MouseEvent) => void;
  onRight: (e: React.MouseEvent) => void;
}> = ({ label, value, onLeft, onRight }) => (
  <div style={S.group}>
    <div style={S.groupLabel}>{label}</div>
    <div style={S.arrows}>
      <button style={S.arrow} onClick={onLeft}>
        ◀
      </button>
      <div style={{ ...S.value, color: value === 0 ? "#a99" : "#e7481c" }}>
        {value === 0 ? "0" : signed(value)}
      </div>
      <button style={S.arrow} onClick={onRight}>
        ▶
      </button>
    </div>
  </div>
);

// A proportional bar of the line's words — each rectangle's WIDTH is how long
// that word takes (its baked char span). Gaps between rects are the silences;
// two rects touching/overlapping shows where words run into each other.
const WordTimeline: React.FC<{
  line: Line;
  win: { s: number; e: number };
  words: string[];
  selectedWord: number | null;
  onPick: (wi: number) => void;
}> = ({ line, win, words, selectedWord, onPick }) => {
  const spans = wordSpans(line, win);
  if (!spans.length) return null;
  const t0 = Math.min(win.s, ...spans.map((s) => s.start));
  const t1 = Math.max(win.e, ...spans.map((s) => s.end));
  const dur = Math.max(1e-6, t1 - t0);
  return (
    <div style={S.timeline}>
      {spans.map((sp) => {
        const wi = sp.wi;
        const isEdge = wi === 0 || wi === words.length - 1;
        const touched = (line.wordShifts?.[wi] ?? 0) !== 0;
        const left = ((sp.start - t0) / dur) * 100;
        const width = Math.max(0.8, ((sp.end - sp.start) / dur) * 100);
        return (
          <div
            key={wi}
            onClick={isEdge ? undefined : () => onPick(wi)}
            title={`${words[wi]} · ${(sp.end - sp.start).toFixed(2)}s`}
            style={{
              ...S.timelineRect,
              left: `${left}%`,
              width: `${width}%`,
              background: isEdge ? "#d8ccb2" : touched ? "#eaa588" : wi % 2 ? "#c9b487" : "#bda876",
              cursor: isEdge ? "default" : "pointer",
              ...(selectedWord === wi ? S.timelineRectSel : null),
            }}
          >
            <span style={S.timelineLabel}>{words[wi]}</span>
          </div>
        );
      })}
    </div>
  );
};

// The 3-level nudge controls for the selected line: Block (whole section) →
// Line (start/end) → Word (micro-shift one word). Coarse-to-fine, top to bottom.
const LevelsPanel: React.FC<{
  line: Line | null;
  win: { s: number; e: number } | null;
  selectedWord: number | null;
  onPickWord: (wi: number) => void;
  onBlock: (dir: 1 | -1) => void;
  onLine: (which: "start" | "end", dir: 1 | -1) => void;
  onWord: (dir: 1 | -1) => void;
}> = ({ line, win, selectedWord, onPickWord, onBlock, onLine, onWord }) => {
  if (!line) return <div style={S.levelsHint}>Select a line to nudge its block · line · words.</div>;
  const words = wordsOf(line.text);
  const wordSelected = selectedWord != null && selectedWord > 0 && selectedWord < words.length - 1;
  return (
    <div style={S.levels}>
      <div style={S.levelRow}>
        <div style={S.levelName}>
          Block<span style={S.levelSub}>{line.section}</span>
        </div>
        <Group label="section" value={line.delay ?? 0} onLeft={() => onBlock(-1)} onRight={() => onBlock(1)} />
      </div>
      <div style={S.levelRow}>
        <div style={S.levelName}>Line</div>
        <div style={{ display: "flex", gap: 14 }}>
          <Group label="start" value={line.startShift ?? 0} onLeft={() => onLine("start", -1)} onRight={() => onLine("start", 1)} />
          <Group label="end" value={line.endShift ?? 0} onLeft={() => onLine("end", -1)} onRight={() => onLine("end", 1)} />
        </div>
      </div>
      <div style={S.levelRow}>
        <div style={S.levelName}>Word</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
          {/* fixed arrows at the ends (they don't move); they act on the selected
              word and light up only when one is picked. Value hangs below each chip. */}
          <div style={S.wordRow}>
            <button
              style={{ ...S.arrow, ...(wordSelected ? S.arrowActive : S.arrowDisabled) }}
              disabled={!wordSelected}
              onClick={() => onWord(-1)}
              title="selected word earlier"
            >
              ◀
            </button>
            <div style={S.wordChips}>
              {words.map((wd, wi) => {
                const sh = line.wordShifts?.[wi] ?? 0;
                // first/last word == the line's start/end — nudge those at the Line
                // level; only the MIDDLE words get independent word shifts.
                const isEdge = wi === 0 || wi === words.length - 1;
                return (
                  <button
                    key={wi}
                    onClick={isEdge ? undefined : () => onPickWord(wi)}
                    disabled={isEdge}
                    title={isEdge ? "first/last word — use Line start / end" : undefined}
                    style={{
                      ...S.wordChip,
                      ...(isEdge ? S.wordChipEdge : null),
                      ...(selectedWord === wi ? S.wordChipSel : null),
                      ...(sh ? S.wordChipTouched : null),
                    }}
                  >
                    {wd}
                    {sh ? <span style={S.wordChipVal}>{signed(sh)}</span> : null}
                  </button>
                );
              })}
            </div>
            <button
              style={{ ...S.arrow, ...(wordSelected ? S.arrowActive : S.arrowDisabled) }}
              disabled={!wordSelected}
              onClick={() => onWord(1)}
              title="selected word later"
            >
              ▶
            </button>
          </div>
          {!wordSelected && words.length <= 2 ? (
            <div style={S.levelsHint}>edge words = Line start / end</div>
          ) : null}
          {win ? (
            <WordTimeline line={line} win={win} words={words} selectedWord={selectedWord} onPick={onPickWord} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

// A legend row: each token is one key (→ its own <kbd>) or a separator ("+" / "/").
const SEPARATORS = new Set(["+", "/"]);
const Legend: React.FC<{ k: string[]; d: string }> = ({ k, d }) => (
  <div style={S.legendRow}>
    <div style={S.keys}>
      {k.map((t, i) =>
        SEPARATORS.has(t) ? (
          <span key={i} style={S.sep}>
            {t}
          </span>
        ) : (
          <kbd key={i} style={S.kbd}>
            {t}
          </kbd>
        )
      )}
    </div>
    <div style={S.legendDesc}>{d}</div>
  </div>
);

// ---- styles (inline; this is a dev tool, no CSS pipeline) -------------------
const S: Record<string, React.CSSProperties> & { saveBadge: Record<string, React.CSSProperties> } = {
  app: { position: "fixed", inset: 0, display: "flex", flexDirection: "column", fontFamily: "ui-sans-serif, system-ui, sans-serif", background: "#f4efe4", color: "#3a352c" },
  center: { position: "fixed", inset: 0, display: "grid", placeItems: "center", fontFamily: "ui-sans-serif, system-ui", color: "#3a352c", background: "#f4efe4" },
  header: { display: "flex", alignItems: "center", gap: 12, padding: `12px ${PANE_PAD}px`, borderBottom: "1px solid #ddd3bf", background: "#faf6ec" },
  spacer: { flex: 1 },
  control: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6f685c" },
  select: { fontSize: 13, padding: "2px 4px", borderRadius: 5, border: "1px solid #cbc1ac", background: "#fff" },
  toggle: { fontSize: 13, padding: "4px 10px", borderRadius: 6, border: "1px solid #cbc1ac", background: "#fff", cursor: "pointer", color: "#3a352c" },
  badge: { fontSize: 12, padding: "3px 8px", borderRadius: 20, fontVariant: "small-caps", minWidth: 52, textAlign: "center" },
  saveBadge: {
    idle: { background: "#e9e1cf", color: "#8c8578" },
    saving: { background: "#fce7b8", color: "#8a6d1c" },
    saved: { background: "#cfead0", color: "#3f7a43" },
    error: { background: "#f4cfc7", color: "#b23a22" },
  },
  body: { flex: 1, display: "flex", minHeight: 0 },
  left: { flex: "0 0 auto", boxSizing: "border-box", padding: `18px ${PANE_PAD}px`, display: "flex", flexDirection: "column", alignItems: "flex-start", overflowY: "auto", background: "#f7f2e7" },
  divider: { flex: "0 0 auto", width: 8, cursor: "col-resize", background: "#e7dcc6", borderLeft: "1px solid #ddd3bf", borderRight: "1px solid #ddd3bf", display: "flex", alignItems: "center", justifyContent: "center" },
  dividerGrip: { width: 2, height: 34, borderRadius: 2, background: "#b6ab92" },
  controls: { display: "flex", alignItems: "center", gap: 10, marginTop: 10, width: "100%" },
  playBtn: { width: 36, height: 30, borderRadius: 6, border: "1px solid #cbc1ac", background: "#fff", cursor: "pointer", fontSize: 12, color: "#5a5348", display: "grid", placeItems: "center" },
  scrub: { flex: 1, accentColor: "#e7481c", cursor: "pointer" },
  time: { fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#6f685c", minWidth: 96, textAlign: "right" },
  playhead: { marginTop: 10, fontSize: 13, fontFamily: "ui-monospace, monospace", color: "#6f685c" },
  bottomPanels: { marginTop: 18, width: "100%", display: "flex", flexWrap: "wrap", gap: 28, alignItems: "stretch" },
  panel: { minWidth: 260 },
  panelSep: { alignSelf: "stretch", width: 1, background: "#e0d6c1" },
  panelTitle: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a99f8c", fontWeight: 700, marginBottom: 10 },
  levels: { display: "flex", flexDirection: "column", gap: 12 },
  levelsHint: { fontSize: 12, color: "#a99f8c", padding: "4px 0", maxWidth: 260 },
  levelRow: { display: "flex", alignItems: "flex-start", gap: 14 },
  levelName: { width: 52, paddingTop: 4, fontSize: 13, fontWeight: 700, color: "#5a5348", display: "flex", flexDirection: "column", gap: 1 },
  levelSub: { fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a99f8c" },
  wordRow: { display: "flex", alignItems: "flex-start", gap: 8 },
  wordChips: { display: "flex", flexWrap: "wrap", columnGap: 6, rowGap: 22, maxWidth: 300, paddingBottom: 12 },
  arrowActive: { borderColor: "#e7481c", color: "#e7481c" },
  arrowDisabled: { opacity: 0.4, cursor: "default" },
  timeline: { position: "relative", width: "100%", maxWidth: 340, height: 34, background: "#efe7d6", borderRadius: 6, marginTop: 6 },
  timelineRect: { position: "absolute", top: 3, bottom: 3, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxSizing: "border-box", border: "1px solid rgba(0,0,0,0.06)" },
  timelineRectSel: { outline: "2px solid #e7481c", outlineOffset: -1, zIndex: 2 },
  timelineLabel: { fontFamily: "'Zen Maru Gothic', ui-sans-serif, system-ui", fontSize: 11, color: "#3a352c", whiteSpace: "nowrap", padding: "0 3px", pointerEvents: "none" },
  wordChip: { position: "relative", fontFamily: "'Zen Maru Gothic', ui-sans-serif, system-ui", fontSize: 15, padding: "3px 9px", borderRadius: 6, border: "1px solid #cbc1ac", background: "#fff", cursor: "pointer", color: "#41403a", lineHeight: 1.3 },
  wordChipEdge: { opacity: 0.45, cursor: "default", background: "#f2ecdf", color: "#8c8578" },
  wordChipSel: { borderColor: "#e7481c", boxShadow: "inset 0 0 0 1px #e7481c" },
  wordChipTouched: { background: "#fbeee6", borderColor: "#eab9a5" },
  // hung below the chip (absolute) so the value never changes the chip's width
  wordChipVal: { position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 3, fontSize: 10, color: "#e7481c", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", pointerEvents: "none" },
  legend: { display: "flex", flexDirection: "column", gap: 9 },
  legendRow: { display: "flex", alignItems: "center", gap: 12 },
  legendDesc: { fontSize: 13, color: "#8c8578" },
  keys: { display: "flex", alignItems: "center", gap: 6, minWidth: 132 },
  sep: { fontSize: 13, color: "#b6ab92", padding: "0 1px" },
  kbd: { fontFamily: "ui-monospace, monospace", fontSize: 15, lineHeight: 1, minWidth: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 10px", borderRadius: 7, border: "1px solid #cbc1ac", borderBottomWidth: 3, background: "#fff", color: "#41403a", boxShadow: "0 1px 0 rgba(0,0,0,0.03)" },
  right: { flex: 1, overflowY: "auto", padding: "6px 10px" },
  section: { display: "flex", alignItems: "center", gap: 10, padding: "14px 10px 4px" },
  sectionLabel: { fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#b6ab92", whiteSpace: "nowrap" },
  sectionRule: { flex: 1, height: 1, background: "#e6dcc7" },
  row: { display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", borderRadius: 8, cursor: "pointer", borderBottom: "1px solid #eee5d3" },
  rowSel: { background: "#fff", boxShadow: "inset 0 0 0 2px #e7481c" },
  rowActive: { background: "#fbf3df" },
  idx: { width: 24, textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#a99f8c" },
  text: { flex: 1, minWidth: 0 },
  times: { fontSize: 11, fontFamily: "ui-monospace, monospace", color: "#a99f8c", marginTop: 2 },
  group: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  groupLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a99f8c" },
  arrows: { display: "flex", alignItems: "center", gap: 4 },
  arrow: { width: 26, height: 26, borderRadius: 6, border: "1px solid #cbc1ac", background: "#fff", cursor: "pointer", fontSize: 11, color: "#5a5348", display: "grid", placeItems: "center" },
  value: { minWidth: 40, textAlign: "center", fontFamily: "ui-monospace, monospace", fontSize: 12 },
  reset: { width: 26, height: 26, borderRadius: 6, border: "1px solid #cbc1ac", background: "#fff", cursor: "pointer", fontSize: 13, color: "#8c8578" },
};

createRoot(document.getElementById("root")!).render(<App />);
