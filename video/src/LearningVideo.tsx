import React, { useMemo, useState, useEffect } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fitText } from "@remotion/layout-utils";
import { useAudioData, visualizeAudio, type AudioData } from "@remotion/media-utils";
import type { CharTime, LearningLine, LearningTiming } from "./types";
import { getLearningTiming } from "./songs/learning-registry";
import { fontFamily, fontsReady } from "./fonts";

// The learning video's fixed warm-cream world (matches the approved storyboard).
const P = {
  paper: "#faf3e3",
  sung: "#e7481c", // karaoke red
  gold: "#d99a2e", // refrain sung — the sing-along hook
  cur: "#8c8578", // active line, not yet sung
  next: "#c6c0b1", // the previewed line, in grey
  dotOn: "#e7481c",
  dotOff: "#d9cfba",
  wave: "#cabfa6",
  meta: "#948c7e",
  metaName: "#6f685c",
  placeholderFill: "rgba(140,133,120,0.13)",
  placeholderLine: "rgba(140,133,120,0.34)",
};

// ---- illustration sizing policy --------------------------------------------
// Art lives in two horizontal bands (top + bottom), tiled small and repeated; a
// missing file degrades to a neutral placeholder card. Tile size and count are
// aspect-aware (computed by the parent): 6 across in landscape, 3 in portrait.

const evenTimes = (n: number, start: number, end: number): CharTime[] => {
  const step = (end - start) / Math.max(1, n);
  return Array.from({ length: n }, (_, i) => ({
    start: start + i * step,
    end: start + (i + 1) * step,
  }));
};

// Bake every line's manual nudges into plain start/end/chars, then CASCADE.
//
// Per line: `delay` shifts both ends equally; `startShift`/`endShift` move each
// end independently. Then a forward pass enforces order — a line can never start
// before the previous line ends, so a nudged end that spills past the next line's
// start pulls that next start up to meet it (rippling forward). Without this the
// active-line hand-off stumbles wherever two windows overlap.
//
// Each line's aligned `chars[]` are re-mapped PROPORTIONALLY into its FINAL
// (post-cascade) window, so the karaoke fill keeps its rhythm and lands where the
// nudges put it. Pure and non-destructive: source lines are never mutated, and a
// line with no nudge and no overlap is returned untouched.
const bakeLines = (raw: LearningLine[]): LearningLine[] => {
  // 1) each line's window after its own delay / start- / endShift
  const wins = raw.map((l) => {
    const d = l.delay ?? 0;
    return { s: l.start + d + (l.startShift ?? 0), e: l.end + d + (l.endShift ?? 0) };
  });
  // 2) forward cascade: a line never starts before the previous one ends, and
  //    when it IS pushed it slides forward keeping its own duration (rather than
  //    collapsing to a sliver) — so extending one line's end pushes the whole
  //    tail forward, contiguous and non-overlapping.
  let floor = -Infinity;
  const finals = wins.map((w) => {
    const s = Math.max(w.s, floor);
    const e = s + Math.max(w.e - w.s, 1e-3);
    floor = e;
    return { s, e };
  });
  // 3) re-map each line's original chars into its final window, then apply any
  //    per-word micro-shifts on top.
  return raw.map((l, k) => {
    const { s, e } = finals[k];
    const os = l.start;
    const oe = l.end;
    const windowMoved = s !== os || e !== oe;
    const hasWords = !!l.wordShifts?.some((x) => x);
    if (!windowMoved && !hasWords) return l; // untouched — no work, no new object
    let chars = l.chars;
    if (chars && windowMoved) {
      const span = Math.max(1e-6, oe - os);
      const remap = (x: number) => s + ((x - os) / span) * (e - s);
      chars = chars.map((c) => ({ start: remap(c.start), end: remap(c.end) }));
    }
    if (chars && hasWords) chars = applyWordShifts(l.text, chars, l.wordShifts!);
    return { ...l, start: s, end: e, chars };
  });
};

// Word index for each display glyph (-1 for spaces). A new word starts at the
// first non-space after a space OR after a comma — the comma stays with the word
// it follows (so "あと、そら" is two words). MUST match wordOfGlyphs in the nudge
// GUI (nudge-gui/main.tsx) so wordShifts indices line up.
const wordOfGlyphs = (glyphs: string[]): number[] => {
  const out: number[] = [];
  let w = -1;
  let boundary = true;
  for (const g of glyphs) {
    if (g === " ") {
      out.push(-1);
      boundary = true;
      continue;
    }
    if (boundary) {
      w++;
      boundary = false;
    }
    out.push(w);
    if (g === "、" || g === "，") boundary = true;
  }
  return out;
};

// Offset each word's characters by its wordShifts[] entry, then CASCADE within
// the line: a word can't start before the previous word ends, so a word shifted
// so far it runs into the next pushes that next word forward (rippling on). Word
// boundaries follow wordOfGlyphs (spaces and commas); missing shifts = 0.
const applyWordShifts = (text: string, chars: CharTime[], shifts: number[]): CharTime[] => {
  const wmap = wordOfGlyphs(Array.from(text));
  const nWords = wmap.reduce((m, w) => Math.max(m, w), -1) + 1;
  // each word's [start, end] after its own shift
  const wStart = new Array<number>(nWords).fill(Infinity);
  const wEnd = new Array<number>(nWords).fill(-Infinity);
  chars.forEach((c, i) => {
    const w = wmap[i];
    if (w < 0) return;
    const sh = shifts[w] ?? 0;
    wStart[w] = Math.min(wStart[w], c.start + sh);
    wEnd[w] = Math.max(wEnd[w], c.end + sh);
  });
  // forward push so words never overlap; total per-word offset = own shift + push
  const push = new Array<number>(nWords).fill(0);
  let floor = -Infinity;
  for (let w = 0; w < nWords; w++) {
    if (!Number.isFinite(wStart[w])) continue;
    push[w] = Math.max(0, floor - wStart[w]);
    floor = wEnd[w] + push[w];
  }
  return chars.map((c, i) => {
    const w = wmap[i];
    const total = w >= 0 ? (shifts[w] ?? 0) + push[w] : 0;
    return total ? { start: c.start + total, end: c.end + total } : c;
  });
};

// One illustration with a graceful placeholder fallback (missing art never
// cancels the render — it shows a neutral card so the gap is obvious but safe).
const IlloImg: React.FC<{ src: string; size: number }> = ({ src, size }) => {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.14,
          background: P.placeholderFill,
          border: `2px dashed ${P.placeholderLine}`,
        }}
      />
    );
  }
  return (
    <Img
      src={src}
      onError={() => setOk(false)}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
};

// A band of tiled illustrations with a gentle papercraft sway (rotate + bob),
// staggered per tile, plus a shared beat pulse.
const Strip: React.FC<{
  keys: string[];
  base: string;
  yFrac: number;
  w: number;
  h: number;
  t: number;
  pulse: number;
  size: number; // tile size (aspect-aware, computed by the parent)
  tiles: number; // how many across the band
  marginFrac: number; // side inset as a fraction of width (bigger in portrait)
  offset?: number; // shift the repeating pattern (bottom band starts one over)
}> = ({ keys, base, yFrac, w, h, t, pulse, size, tiles, marginFrac, offset = 0 }) => {
  if (!keys.length) return null;
  const margin = w * marginFrac;
  const inner = w - margin * 2;
  return (
    <>
      {Array.from({ length: tiles }, (_, i) => {
        const key = keys[(i + offset) % keys.length];
        const x = margin + (i / (tiles - 1)) * inner;
        const sway = 4 * Math.sin(t * 1.5 + i * 0.9); // degrees
        const bob = h * 0.006 * Math.sin(t * 1.9 + i * 0.6);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: h * yFrac - size / 2 + bob,
              width: size,
              height: size,
              transform: `rotate(${sway}deg) scale(${pulse})`,
              transformOrigin: "center",
            }}
          >
            <IlloImg src={staticFile(`${base}/${key}.png`)} size={size} />
          </div>
        );
      })}
    </>
  );
};

const fmtTime = (s: number) => {
  const sec = Math.max(0, Math.floor(s));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
};

// The ICONOTES symbol mark (brand SVG, tinted to the corner text tone), top-right.
const LogoMark: React.FC<{ h: number }> = ({ h }) => {
  const pad = h * 0.055;
  const height = h * 0.036;
  return (
    <div style={{ position: "absolute", top: pad, right: pad * 1.9 }}>
      <Img src={staticFile("iconote-symbol.svg")} style={{ height, width: "auto", display: "block" }} />
    </div>
  );
};

// The track label (top-left): track no, play, hiragana row. In portrait the song
// name stacks on a second line, left-aligned directly under the row kana (it
// shares the row's column, so both start at the same x).
const MediaPlayer: React.FC<{ t: LearningTiming; h: number; isPortrait: boolean }> = ({ t, h, isPortrait }) => {
  const pad = h * 0.055;
  const rowSpan = (
    <span style={{ fontFamily, fontWeight: 700, fontSize: h * 0.027, color: P.metaName, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
      {t.row}
    </span>
  );
  return (
    <div style={{ position: "absolute", top: pad, left: pad * 1.9, display: "flex", alignItems: "flex-start", gap: h * 0.016 }}>
      <span
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: h * 0.022,
          color: P.paper,
          background: P.metaName,
          borderRadius: h * 0.006,
          padding: `${h * 0.004}px ${h * 0.01}px`,
          letterSpacing: "0.04em",
        }}
      >
        {t.trackNo}
      </span>
      <span style={{ color: P.sung, fontSize: h * 0.022 }}>▶</span>
      {isPortrait ? (
        <div style={{ display: "flex", flexDirection: "column", gap: h * 0.007 }}>
          {rowSpan}
          <span style={{ fontFamily, fontWeight: 700, fontSize: h * 0.027, color: P.metaName, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
            {t.trackName}
          </span>
        </div>
      ) : (
        rowSpan
      )}
    </div>
  );
};

// The song name (hiragana), centered along the top BETWEEN the row and the logo.
// Landscape only — in portrait the name lives under the row inside MediaPlayer.
const RowBadge: React.FC<{ t: LearningTiming; h: number; isPortrait: boolean }> = ({ t, h, isPortrait }) => {
  if (isPortrait) return null;
  const pad = h * 0.055;
  return (
    <div style={{ position: "absolute", top: pad, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <span style={{ fontFamily, fontWeight: 700, fontSize: h * 0.027, color: P.metaName, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
        {t.trackName}
      </span>
    </div>
  );
};

// The progress bar + time, centered along the bottom. Landscape keeps it level
// with the corners; portrait lifts it to its own line ABOVE the corner metadata
// (style·bpm / ©channel) so the narrow frame doesn't collide the three centred.
const BottomProgress: React.FC<{ h: number; w: number; now: number; dur: number; isPortrait: boolean }> = ({ h, w, now, dur, isPortrait }) => {
  const pad = h * 0.055;
  const bottom = isPortrait ? pad + h * 0.05 : pad;
  const prog = Math.max(0, Math.min(1, now / dur));
  return (
    <div
      style={{
        position: "absolute",
        bottom,
        // portrait: span the padded width so the bar reads full-width; landscape
        // stays a centred fixed-width control level with the corners.
        left: isPortrait ? pad * 1.9 : 0,
        right: isPortrait ? pad * 1.9 : 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: h * 0.016,
      }}
    >
      <div style={{ position: "relative", flex: isPortrait ? 1 : "0 0 auto", width: isPortrait ? "auto" : w * 0.17, height: h * 0.006, borderRadius: h * 0.004, background: P.dotOff }}>
        <div style={{ width: `${prog * 100}%`, height: "100%", borderRadius: h * 0.004, background: P.metaName }} />
        <div
          style={{
            position: "absolute",
            left: `${prog * 100}%`,
            top: "50%",
            width: h * 0.014,
            height: h * 0.014,
            borderRadius: "50%",
            background: P.sung,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: h * 0.022, color: P.meta, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
        {fmtTime(now)} / {fmtTime(dur)}
      </span>
    </div>
  );
};

const Corners: React.FC<{ t: LearningTiming; h: number }> = ({ t, h }) => {
  const mono = {
    position: "absolute" as const,
    fontFamily: "ui-monospace, monospace",
    fontSize: h * 0.026,
    color: P.meta,
    letterSpacing: "0.05em",
    whiteSpace: "nowrap" as const,
  };
  const pad = h * 0.055;
  return (
    <>
      <div style={{ ...mono, bottom: pad, left: pad * 1.9 }}>
        {t.style} · {t.bpm} BPM
      </div>
      <div style={{ ...mono, bottom: pad, right: pad * 1.9 }}>
        <span style={{ color: P.sung, marginRight: h * 0.004 }}>©</span>{t.channel}
      </div>
    </>
  );
};

// Break a line into up to two visual rows at the comma (portrait only), so each
// row is shorter and the font can grow. Returns arrays of GLOBAL glyph indices —
// karaoke timing stays indexed against the whole line, whichever row a glyph sits
// in. A line with no comma (or an unsplittable one) stays a single row.
const splitRows = (glyphs: string[], multiline: boolean): number[][] => {
  const all = glyphs.map((_, i) => i);
  if (!multiline) return [all];
  const commaAt = glyphs.findIndex((g) => g === "、" || g === "，");
  if (commaAt < 0 || commaAt === glyphs.length - 1) return [all];
  const first = all.slice(0, commaAt + 1);
  let second = all.slice(commaAt + 1);
  while (second.length && glyphs[second[0]] === " ") second = second.slice(1);
  if (!second.length) return [all];
  return [first, second];
};

// The text of each visual row a line would render as — used by the font-fit pass
// so it can size against the widest ROW (portrait) rather than the whole line.
const rowTextsOf = (text: string, multiline: boolean): string[] => {
  const g = Array.from(text);
  return splitRows(g, multiline).map((idxs) => idxs.map((i) => g[i]).join(""));
};

// A centered line. The active line colours each glyph as it is sung (red, or gold
// on a refrain); the previewed line stays grey. Both roles fill IN PLACE. In
// portrait a long line stacks onto a second row at the comma.
const Line: React.FC<{
  line: LearningLine;
  t: number;
  fontPx: number;
  role: "active" | "preview";
  multiline: boolean;
}> = ({ line, t, fontPx, role, multiline }) => {
  const glyphs = useMemo(() => Array.from(line.text), [line.text]);
  const times =
    line.chars && line.chars.length === glyphs.length
      ? line.chars
      : evenTimes(glyphs.length, line.start, line.end);
  const lit =
    line.section === "refrain" || line.section === "intro" || line.section === "outro"
      ? P.gold
      : P.sung;
  const rest = role === "active" ? P.cur : P.next;
  const rows = useMemo(() => splitRows(glyphs, multiline), [glyphs, multiline]);
  const glyph = (i: number) => {
    if (glyphs[i] === " ") return <span key={i} style={{ width: fontPx * 0.42 }} />;
    const sung = role === "active" && t >= times[i].start;
    return (
      <span
        key={i}
        style={{
          color: sung ? lit : rest,
          textShadow: sung ? `0 0 ${fontPx * 0.14}px rgba(231,72,28,0.22)` : "none",
        }}
      >
        {glyphs[i]}
      </span>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: fontPx * 0.06 }}>
      {rows.map((row, r) => (
        <div
          key={r}
          style={{
            display: "inline-flex",
            justifyContent: "center",
            whiteSpace: "nowrap",
            fontFamily,
            fontWeight: 900,
            fontSize: fontPx,
            lineHeight: 1.14,
          }}
        >
          {row.map(glyph)}
        </div>
      ))}
    </div>
  );
};

export const LearningVideo: React.FC<{ songId: string; timingOverride?: LearningTiming }> = ({
  songId,
  timingOverride,
}) => {
  // Normally the timing is resolved from the registry by id. The nudge GUI passes
  // a live `timingOverride` instead, so tweaking a shift re-renders instantly.
  const timing = timingOverride ?? getLearningTiming(songId);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps - (timing.offsetSeconds ?? 0);

  // Sizing keys off the SHORT edge (S) so the same template works landscape and
  // portrait; positions stay fractions of width/height. Portrait uses fewer,
  // larger illustration tiles per band.
  const S = Math.min(width, height);
  const isPortrait = height > width;
  const tiles = isPortrait ? 3 : 6;
  const illoSize = isPortrait ? width * 0.17 : height * 0.132;
  // Portrait pulls the two edge tiles well inside the frame; landscape spreads
  // across six with a slimmer inset.
  const illoMarginFrac = isPortrait ? 0.2 : 0.11;

  const [fontReady, setFontReady] = useState(false);
  const [handle] = useState(() => delayRender("load-font"));
  useEffect(() => {
    fontsReady
      .then(() => {
        setFontReady(true);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);

  const audioData = useAudioData(staticFile(timing.audio));
  const spectrum = audioData
    ? visualizeAudio({ fps, frame, audioData, numberOfSamples: 16 })
    : null;
  const bass = spectrum ? (spectrum[0] + spectrum[1]) / 2 : 0;
  const beatPhase = (t * timing.bpm) / 60;
  const pulse = spectrum
    ? 1 + Math.min(0.07, bass * 1.2)
    : 1 + 0.035 * (0.5 + 0.5 * Math.sin(beatPhase * Math.PI));

  // Bake nudges + cascade up front, so the rest of the renderer reads plain,
  // ordered, non-overlapping start/end/chars.
  const lines = useMemo(() => bakeLines(timing.lines), [timing]);
  const lineStart = (k: number) => lines[k].start;

  // Active line = the latest line that has STARTED (nudges already baked in).
  // Holding the most-recent line through the gaps between lines is what stops
  // the old bug where a musical gap briefly flashed the final line's content.
  let i = 0;
  for (let k = 0; k < lines.length; k++) {
    if (t >= lineStart(k)) i = k;
  }

  // ping-pong: even lines live in the TOP slot, odd lines in the BOTTOM slot.
  // The active line sits in its slot (filling); the next line previews in the
  // other slot. Neither ever moves — only the off-slot's content updates.
  const topActive = i % 2 === 0;
  const topIdx = topActive ? i : i + 1;
  const bottomIdx = topActive ? i + 1 : i;

  // subtle fade when a slot takes on a new line (it enters as a preview at the
  // start of the previous line; the active line never re-fades — it fills in place)
  const slotOpacity = (idx: number) => {
    if (idx < 0 || idx >= lines.length) return 0;
    const sw = idx > 0 ? lineStart(idx - 1) : 0;
    return interpolate(t, [sw, sw + 0.12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  const topLine = topIdx < lines.length ? lines[topIdx] : undefined;
  const bottomLine = bottomIdx < lines.length ? lines[bottomIdx] : undefined;

  // fit: both slots share one size, shrunk so the widest VISUAL ROW fits, floored.
  // Portrait breaks long lines at the comma, so it fits shorter rows and lifts the
  // cap — the content after the comma can then be read at a bigger size.
  const maxFont = S * (isPortrait ? 0.11 : 0.086);
  const minFont = S * 0.05;
  const availW = width * (isPortrait ? 0.8 : 0.84);
  const fontPx = useMemo(() => {
    if (!fontReady) return maxFont;
    const rows = [topLine?.text, bottomLine?.text]
      .filter((s): s is string => Boolean(s))
      .flatMap((text) => rowTextsOf(text, isPortrait));
    if (!rows.length) return maxFont;
    const sizes = rows.map(
      (text) => fitText({ text, withinWidth: availW, fontFamily, fontWeight: 900 }).fontSize
    );
    return Math.max(minFont, Math.min(maxFont, ...sizes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topLine?.text, bottomLine?.text, fontReady, height, width]);

  const illos = lines[i]?.illos ?? [];

  // count-in dots (before the first line)
  const firstStart = lines[0].start;
  const countIn = timing.countInSeconds ?? 0;
  const inCountIn = t < firstStart && countIn > 0;
  const dotsLit = Math.min(
    3,
    Math.ceil(
      interpolate(t, [firstStart - countIn, firstStart], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }) * 3
    )
  );

  // slots sit above/below the centre so the waveform divides them at 50%
  const TOP_SLOT = 0.4;
  const BOTTOM_SLOT = 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: P.paper, fontFamily }}>
      <Audio src={staticFile(timing.audio)} />
      <Corners t={timing} h={S} />
      <MediaPlayer t={timing} h={S} isPortrait={isPortrait} />
      <RowBadge t={timing} h={S} isPortrait={isPortrait} />
      <BottomProgress h={S} w={width} now={t} dur={timing.durationSeconds ?? 180} isPortrait={isPortrait} />
      <LogoMark h={S} />

      {/* two illustration bands — bottom offset by one so the rows don't line up */}
      <Strip keys={illos} base={timing.ilBase} yFrac={0.218} w={width} h={height} t={t} pulse={pulse} size={illoSize} tiles={tiles} marginFrac={illoMarginFrac} offset={0} />
      <Strip keys={illos} base={timing.ilBase} yFrac={0.772} w={width} h={height} t={t} pulse={pulse} size={illoSize} tiles={tiles} marginFrac={illoMarginFrac} offset={1} />

      {/* count-in dots, just above the top lyric slot */}
      {inCountIn ? (
        <div
          style={{
            position: "absolute",
            top: height * (TOP_SLOT - 0.075),
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: S * 0.022,
          }}
        >
          {[0, 1, 2].map((k) => (
            <div
              key={k}
              style={{
                width: S * 0.022,
                height: S * 0.022,
                borderRadius: "50%",
                background: k < dotsLit ? P.dotOn : P.dotOff,
              }}
            />
          ))}
        </div>
      ) : null}

      {/* fixed top slot */}
      <div
        style={{
          position: "absolute",
          top: height * TOP_SLOT,
          left: 0,
          right: 0,
          textAlign: "center",
          transform: "translateY(-50%)",
          opacity: slotOpacity(topIdx),
        }}
      >
        {topLine ? (
          <Line line={topLine} t={t} fontPx={fontPx} role={topActive ? "active" : "preview"} multiline={isPortrait} />
        ) : null}
      </div>

      {/* fixed bottom slot */}
      <div
        style={{
          position: "absolute",
          top: height * BOTTOM_SLOT,
          left: 0,
          right: 0,
          textAlign: "center",
          transform: "translateY(-50%)",
          opacity: slotOpacity(bottomIdx),
        }}
      >
        {bottomLine ? (
          <Line line={bottomLine} t={t} fontPx={fontPx} role={topActive ? "preview" : "active"} multiline={isPortrait} />
        ) : null}
      </div>

      <LineWave h={height} w={width} s={S} audioData={audioData} t={t} />

      {timing.placeholder ? (
        <div
          style={{
            position: "absolute",
            bottom: height * 0.012,
            width: "100%",
            textAlign: "center",
            fontFamily: "ui-monospace, monospace",
            fontSize: height * 0.017,
            color: "rgba(120,112,96,0.5)",
            letterSpacing: "0.1em",
          }}
        >
          placeholder timing · align for real sync
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// A subtle dark-cream divider at the vertical centre that IS the song's waveform:
// a short window of the raw audio samples around the playhead, so it genuinely
// scrolls and reacts to the rhythm. Tapered ends settle onto the centre line.
const LineWave: React.FC<{
  h: number;
  w: number;
  s: number; // short-edge size unit (band height / amplitude)
  audioData: AudioData | null;
  t: number;
}> = ({ h, w, s, audioData, t }) => {
  const width = w; // edge to edge
  const height = s * 0.08;
  const cy = height / 2;
  const amp = height * 0.46;
  const N = 220;
  let d = "";
  const wave = audioData?.channelWaveforms?.[0];
  if (wave && audioData) {
    const sr = audioData.sampleRate;
    const winSamples = Math.floor(0.09 * sr); // ~90ms window
    const start = Math.floor(t * sr) - Math.floor(winSamples / 2);
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * width;
      const si = start + Math.floor((i / N) * winSamples);
      const s = si >= 0 && si < wave.length ? wave[si] : 0;
      const taper = Math.sin((Math.PI * i) / N);
      const y = cy - Math.max(-1, Math.min(1, s * 2.4)) * amp * taper;
      d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
    }
  } else {
    d = `M0,${cy.toFixed(1)} L${width.toFixed(1)},${cy.toFixed(1)}`;
  }
  return (
    <div style={{ position: "absolute", left: 0, top: h * 0.5 - height / 2, width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
        <path
          d={d}
          fill="none"
          stroke="#9c8b66"
          strokeOpacity={0.5}
          strokeWidth={Math.max(1.5, w * 0.0015)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
