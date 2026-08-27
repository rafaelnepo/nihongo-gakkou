import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, type PlayerRef } from "@remotion/player";
import { LearningVideo } from "../src/LearningVideo";
import { learningDurationInFrames } from "../src/types";
import type { LearningTiming } from "../src/types";

const SONG_ID = "01-aiueo";
const STEPS = [0.02, 0.05, 0.1, 0.2]; // seconds per arrow tap

const fmt = (s: number) => {
  const sec = Math.max(0, s);
  const m = Math.floor(sec / 60);
  const r = (sec % 60).toFixed(2).padStart(5, "0");
  return `${m}:${r}`;
};
const signed = (n: number) => (n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2));

// Mirror LearningVideo's withShift() for the read-outs (start/end after nudges).
const effWindow = (l: LearningTiming["lines"][number]) => {
  const d = l.delay ?? 0;
  const s = l.start + d + (l.startShift ?? 0);
  const e = Math.max(s + 1e-3, l.end + d + (l.endShift ?? 0));
  return { s, e };
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
        const w = effWindow(next.lines[idx]);
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
          return copy;
        });
        const next = { ...prev, lines };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // Move the selection (clamped) and cue the player to that line's start.
  const selectLine = useCallback(
    (idx: number) => {
      setTiming((prev) => {
        if (!prev) return prev;
        const clamped = Math.max(0, Math.min(prev.lines.length - 1, idx));
        setSelected(clamped);
        seekToT(effWindow(prev.lines[clamped]).s);
        return prev;
      });
    },
    [seekToT]
  );

  // Audition: play the selected line from its start, auto-stopping at its end.
  const playLine = useCallback(
    (idx: number | null) => {
      if (idx == null || !timing) return;
      const w = effWindow(timing.lines[idx]);
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

  if (err) return <div style={S.center}>Failed to load timing: {err}</div>;
  if (!timing) return <div style={S.center}>Loading {SONG_ID}…</div>;

  const compW = vertical ? 1080 : 1920;
  const compH = vertical ? 1920 : 1080;
  const previewW = Math.min(1100, leftW - 36); // follows the pane width (drag)

  const activeIdx = timing.lines.reduce((acc, l, k) => {
    const { s } = effWindow(l);
    return nowT >= s ? k : acc;
  }, -1);

  return (
    <div style={S.app}>
      <header style={S.header}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>
          nudge · <span style={{ color: "#e7481c" }}>{SONG_ID}</span>
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
            <div style={S.legend}>
              <Legend k={["←", "→"]} d="start − / +" />
              <Legend k={["⇧←", "⇧→"]} d="end − / +" />
              <Legend k={["↑", "↓"]} d="prev / next line" />
              <Legend k={["R"]} d="replay current line" />
              <Legend k={["Space"]} d="play / pause" />
              <Legend k={["[", "]"]} d="step size" />
            </div>
          </div>
        </div>

        {/* draggable divider — widen the pane to enlarge the video */}
        <div style={S.divider} onMouseDown={startDrag} title="drag to resize">
          <div style={S.dividerGrip} />
        </div>

        {/* right — the line list */}
        <div style={S.right}>
          {timing.lines.map((l, idx) => {
            const w = effWindow(l);
            const ss = l.startShift ?? 0;
            const es = l.endShift ?? 0;
            const touched = ss !== 0 || es !== 0;
            const isSel = selected === idx;
            const isActive = activeIdx === idx;
            return (
              <div
                key={idx}
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

const Legend: React.FC<{ k: string[]; d: string }> = ({ k, d }) => (
  <div style={S.legendRow}>
    <div style={{ display: "flex", gap: 3 }}>
      {k.map((key) => (
        <kbd key={key} style={S.kbd}>
          {key}
        </kbd>
      ))}
    </div>
    <div style={S.legendDesc}>{d}</div>
  </div>
);

// ---- styles (inline; this is a dev tool, no CSS pipeline) -------------------
const S: Record<string, React.CSSProperties> & { saveBadge: Record<string, React.CSSProperties> } = {
  app: { position: "fixed", inset: 0, display: "flex", flexDirection: "column", fontFamily: "ui-sans-serif, system-ui, sans-serif", background: "#f4efe4", color: "#3a352c" },
  center: { position: "fixed", inset: 0, display: "grid", placeItems: "center", fontFamily: "ui-sans-serif, system-ui", color: "#3a352c", background: "#f4efe4" },
  header: { display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid #ddd3bf", background: "#faf6ec" },
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
  left: { flex: "0 0 auto", padding: 18, display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto", background: "#f7f2e7" },
  divider: { flex: "0 0 auto", width: 8, cursor: "col-resize", background: "#e7dcc6", borderLeft: "1px solid #ddd3bf", borderRight: "1px solid #ddd3bf", display: "flex", alignItems: "center", justifyContent: "center" },
  dividerGrip: { width: 2, height: 34, borderRadius: 2, background: "#b6ab92" },
  controls: { display: "flex", alignItems: "center", gap: 10, marginTop: 10, width: "100%" },
  playBtn: { width: 36, height: 30, borderRadius: 6, border: "1px solid #cbc1ac", background: "#fff", cursor: "pointer", fontSize: 12, color: "#5a5348", display: "grid", placeItems: "center" },
  scrub: { flex: 1, accentColor: "#e7481c", cursor: "pointer" },
  time: { fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#6f685c", minWidth: 96, textAlign: "right" },
  playhead: { marginTop: 10, fontSize: 13, fontFamily: "ui-monospace, monospace", color: "#6f685c" },
  legend: { marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" },
  legendRow: { display: "flex", alignItems: "center", gap: 8 },
  legendDesc: { fontSize: 12, color: "#8c8578" },
  kbd: { fontFamily: "ui-monospace, monospace", fontSize: 11, minWidth: 16, textAlign: "center", padding: "2px 5px", borderRadius: 4, border: "1px solid #cbc1ac", borderBottomWidth: 2, background: "#fff", color: "#5a5348" },
  right: { flex: 1, overflowY: "auto", padding: "6px 10px" },
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
