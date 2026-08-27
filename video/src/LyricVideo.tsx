import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/ZenMaruGothic";
import { measureText } from "@remotion/layout-utils";
import { NightSky } from "./NightSky";
import { PALETTES, type Palette } from "./palettes";
import type { VideoProps } from "./schema";
import { getTiming } from "./songs/registry";
import type { CharTime, LyricLine } from "./types";

const font = loadFont("normal", {
  weights: ["500", "700"],
  subsets: ["japanese", "latin"],
  ignoreTooManyRequestsWarning: true,
});
const fontFamily = font.fontFamily;
const WEIGHT = 700;

// Fade a value in over `rise`s after start, out over `fall`s before end.
const envelope = (t: number, start: number, end: number, rise = 0.6, fall = 0.6) => {
  const up = interpolate(t, [start, start + rise], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const down = interpolate(t, [end - fall, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(up, down);
};

// Even fallback timing when WhisperX chars are absent (e.g. hand-timed lines).
const evenTimes = (n: number, start: number, end: number): CharTime[] => {
  const step = (end - start) / Math.max(1, n);
  return Array.from({ length: n }, (_, i) => ({
    start: start + i * step,
    end: start + (i + 1) * step,
  }));
};

// Per-glyph layout via the official measurer (replaces a manual canvas).
const measure = (glyphs: string[], fontPx: number) => {
  const widths = glyphs.map(
    (g) =>
      measureText({ text: g, fontFamily, fontSize: fontPx, fontWeight: WEIGHT })
        .width
  );
  const total = widths.reduce((a, b) => a + b, 0);
  let acc = 0;
  const lefts = widths.map((w) => {
    const l = acc;
    acc += w;
    return l;
  });
  const centers = lefts.map((l, i) => l + widths[i] / 2);
  return { widths, lefts, centers, total };
};

const KaraokeLine: React.FC<{
  line: LyricLine;
  t: number;
  fontReady: boolean;
  palette: Palette;
  showBall: boolean;
}> = ({ line, t, fontReady, palette, showBall }) => {
  const { height } = useVideoConfig();
  const fontPx = height * 0.08;
  const glyphs = useMemo(() => Array.from(line.text), [line.text]);
  const times =
    line.chars && line.chars.length === glyphs.length
      ? line.chars
      : evenTimes(glyphs.length, line.start, line.end);

  const layout = useMemo(
    () => measure(glyphs, fontPx),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [line.text, fontPx, fontReady]
  );

  const lit = palette.sectionTint[line.section] ?? palette.text;
  // Full opacity through the whole [start, end] core; fade only in the gaps
  // just outside it, so a character is never dimmed while it is being sung.
  const appear = interpolate(t, [line.start - 0.3, line.start - 0.02], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const disappear = interpolate(t, [line.end + 0.02, line.end + 0.3], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineOpacity = Math.min(appear, disappear);

  const rowH = fontPx * 1.9;
  const charTop = rowH - fontPx * 1.25;
  const ballR = fontPx * 0.15;
  const restY = charTop - ballR * 2.1;
  const amp = fontPx * 0.55;

  let ballX = layout.centers[0] ?? 0;
  let ballY = restY;
  const ballVisible = showBall && t >= line.start - 0.15 && t <= line.end;
  if (glyphs.length > 0) {
    if (t <= times[0].start) {
      ballX = layout.centers[0];
      ballY = restY;
    } else {
      let i = 0;
      while (i < glyphs.length - 1 && t >= times[i + 1].start) i++;
      const segStart = times[i].start;
      const segEnd = i < glyphs.length - 1 ? times[i + 1].start : times[i].end;
      const frac = interpolate(t, [segStart, segEnd], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const from = layout.centers[i];
      const to = layout.centers[Math.min(i + 1, glyphs.length - 1)];
      ballX = from + (to - from) * frac;
      ballY = restY - amp * Math.sin(Math.PI * frac);
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: layout.total,
        height: rowH,
        opacity: lineOpacity,
      }}
    >
      {glyphs.map((g, i) => {
        const on = interpolate(t, [times[i].start - 0.02, times[i].start + 0.14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const pop = 1 + 0.16 * Math.max(0, on) * Math.max(0, 1 - (t - times[i].start) * 3);
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: layout.lefts[i],
              top: charTop,
              width: layout.widths[i],
              textAlign: "center",
              fontSize: fontPx,
              fontWeight: WEIGHT,
              lineHeight: 1,
              color: on > 0.5 ? lit : palette.charDim,
              opacity: 0.34 + 0.66 * on,
              transform: `translateY(${(1 - on) * 6}px) scale(${pop})`,
              textShadow:
                on > 0.5
                  ? `0 0 ${fontPx * 0.5}px rgba(255,233,184,0.55), 0 2px 18px ${palette.textShadow}`
                  : "none",
            }}
          >
            {g}
          </span>
        );
      })}

      {ballVisible ? (
        <div
          style={{
            position: "absolute",
            left: ballX - ballR,
            top: ballY - ballR,
            width: ballR * 2,
            height: ballR * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle at 36% 32%, #ff9a9a 0%, ${palette.ball} 60%, #d63a3a 100%)`,
            boxShadow: `0 ${ballR * 0.5}px ${ballR * 1.2}px ${palette.ballShadow}`,
          }}
        />
      ) : null}
    </div>
  );
};

export const LyricVideo: React.FC<VideoProps> = ({
  songId,
  palette: paletteId,
  showBall,
  showTitleCard,
}) => {
  const timing = getTiming(songId);
  const palette = PALETTES[paletteId as keyof typeof PALETTES] ?? PALETTES.night;
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;

  const [fontReady, setFontReady] = useState(false);
  const [handle] = useState(() => delayRender("load-font"));
  useEffect(() => {
    font
      .waitUntilDone()
      .then(() => {
        setFontReady(true);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);

  const titleOpacity = showTitleCard
    ? envelope(t, timing.titleCard.start, timing.titleCard.end, 0.8, 0.8)
    : 0;

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: palette.skyBottom }}>
      <NightSky palette={palette} />

      {timing.audio && !timing.placeholder ? (
        <Audio src={staticFile(timing.audio)} />
      ) : null}

      {titleOpacity > 0.001 ? (
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center", opacity: titleOpacity }}
        >
          <div
            style={{
              fontSize: height * 0.11,
              fontWeight: 700,
              color: palette.text,
              letterSpacing: "0.06em",
              textShadow: `0 2px 24px ${palette.textShadow}`,
            }}
          >
            {timing.title}
          </div>
          {timing.dedication ? (
            <div
              style={{
                marginTop: height * 0.035,
                fontSize: height * 0.038,
                fontWeight: 500,
                color: palette.dedication,
                letterSpacing: "0.14em",
              }}
            >
              {timing.dedication}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", paddingTop: height * 0.14 }}
      >
        {(() => {
          const lt = t - (timing.offsetSeconds ?? 0);
          const dly = (i: number) => timing.lines[i].delay ?? 0;
          let active = -1;
          for (let i = 0; i < timing.lines.length; i++) {
            const d = dly(i);
            if (lt >= timing.lines[i].start + d && lt <= timing.lines[i].end + d) active = i;
          }
          if (active < 0) {
            for (let i = 0; i < timing.lines.length; i++) {
              const d = dly(i);
              if (lt >= timing.lines[i].start + d - 0.3 && lt <= timing.lines[i].end + d + 0.3)
                active = i;
            }
          }
          if (active < 0) return null;
          return (
            <KaraokeLine
              key={active}
              line={timing.lines[active]}
              t={lt - dly(active)}
              fontReady={fontReady}
              palette={palette}
              showBall={showBall}
            />
          );
        })()}
      </AbsoluteFill>

      {timing.placeholder ? (
        <div
          style={{
            position: "absolute",
            bottom: height * 0.04,
            width: "100%",
            textAlign: "center",
            fontSize: height * 0.022,
            color: "rgba(246,243,234,0.4)",
            letterSpacing: "0.1em",
          }}
        >
          placeholder timing · no audio yet
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
