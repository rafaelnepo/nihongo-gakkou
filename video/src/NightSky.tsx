import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Palette } from "./palettes";

// A calm night sky: soft vertical gradient, one glowing moon, a scatter of
// slow-twinkling stars. Star positions are a fixed list (no randomness per
// frame), so the render is deterministic.
const STARS: { x: number; y: number; r: number; phase: number }[] = [
  { x: 4, y: 12, r: 1.6, phase: 0.1 }, { x: 8, y: 26, r: 1.2, phase: 2.4 },
  { x: 11, y: 40, r: 1.4, phase: 4.1 }, { x: 6, y: 54, r: 1.1, phase: 1.7 },
  { x: 3, y: 68, r: 1.3, phase: 3.3 }, { x: 15, y: 8, r: 2.0, phase: 5.0 },
  { x: 15, y: 30, r: 1.4, phase: 1.9 }, { x: 13, y: 62, r: 1.0, phase: 0.6 },
  { x: 19, y: 18, r: 1.7, phase: 3.9 }, { x: 22, y: 45, r: 1.2, phase: 2.1 },
  { x: 22, y: 12, r: 1.8, phase: 3.2 }, { x: 26, y: 33, r: 1.1, phase: 4.8 },
  { x: 27, y: 58, r: 1.3, phase: 0.9 }, { x: 31, y: 24, r: 1.2, phase: 0.7 },
  { x: 31, y: 71, r: 1.0, phase: 2.7 }, { x: 35, y: 9, r: 1.6, phase: 5.3 },
  { x: 35, y: 50, r: 1.2, phase: 4.4 }, { x: 39, y: 37, r: 1.4, phase: 1.4 },
  { x: 40, y: 9, r: 1.6, phase: 2.5 }, { x: 43, y: 22, r: 1.1, phase: 3.6 },
  { x: 44, y: 64, r: 1.2, phase: 0.3 }, { x: 48, y: 6, r: 1.4, phase: 2.2 },
  { x: 48, y: 46, r: 1.0, phase: 5.1 }, { x: 52, y: 31, r: 1.5, phase: 1.1 },
  { x: 55, y: 15, r: 1.7, phase: 2.0 }, { x: 55, y: 58, r: 1.1, phase: 3.8 },
  { x: 58, y: 40, r: 1.2, phase: 0.5 }, { x: 61, y: 24, r: 1.3, phase: 4.6 },
  { x: 63, y: 52, r: 1.3, phase: 3.0 }, { x: 63, y: 9, r: 1.5, phase: 1.6 },
  { x: 67, y: 33, r: 1.1, phase: 2.9 }, { x: 67, y: 66, r: 1.0, phase: 5.5 },
  { x: 71, y: 18, r: 1.6, phase: 0.8 }, { x: 74, y: 45, r: 1.2, phase: 4.0 },
  { x: 74, y: 12, r: 1.5, phase: 0.4 }, { x: 78, y: 58, r: 1.1, phase: 2.3 },
  { x: 79, y: 30, r: 1.3, phase: 1.3 }, { x: 82, y: 9, r: 1.7, phase: 3.5 },
  { x: 83, y: 44, r: 1.2, phase: 4.7 }, { x: 86, y: 24, r: 1.1, phase: 0.2 },
  { x: 88, y: 62, r: 1.2, phase: 5.2 }, { x: 90, y: 20, r: 1.9, phase: 1.5 },
  { x: 91, y: 38, r: 1.0, phase: 3.1 }, { x: 94, y: 12, r: 1.4, phase: 2.6 },
  { x: 94, y: 52, r: 1.2, phase: 0.7 }, { x: 96, y: 30, r: 1.1, phase: 4.2 },
  { x: 97, y: 66, r: 1.3, phase: 1.8 }, { x: 9, y: 74, r: 1.1, phase: 3.4 },
  { x: 24, y: 78, r: 1.0, phase: 5.6 }, { x: 51, y: 72, r: 1.1, phase: 0.4 },
  { x: 70, y: 76, r: 1.0, phase: 2.8 }, { x: 85, y: 74, r: 1.2, phase: 4.5 },
];

export const NightSky: React.FC<{ palette: Palette }> = ({ palette }) => {
  const theme = palette;
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // Moon: top-right, warm, with a soft breathing glow.
  const moonX = width * 0.8;
  const moonY = height * 0.24;
  const moonR = height * 0.09;
  const breathe = 0.5 + 0.5 * Math.sin(t * 0.6);
  const glow = moonR * (2.2 + 0.25 * breathe);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${theme.skyTop} 0%, ${theme.skyMid} 48%, ${theme.skyBottom} 100%)`,
      }}
    >
      {/* stars */}
      <AbsoluteFill>
        {STARS.map((s, i) => {
          const twinkle = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.3 + s.phase));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.r * 2,
                height: s.r * 2,
                borderRadius: "50%",
                background: theme.star,
                opacity: twinkle,
                filter: "blur(0.3px)",
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* moon glow */}
      <div
        style={{
          position: "absolute",
          left: moonX - glow,
          top: moonY - glow,
          width: glow * 2,
          height: glow * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.moonGlow} 0%, rgba(246,236,210,0) 70%)`,
        }}
      />
      {/* moon body */}
      <div
        style={{
          position: "absolute",
          left: moonX - moonR,
          top: moonY - moonR,
          width: moonR * 2,
          height: moonR * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 38%, #fffaf0 0%, ${theme.moon} 55%, #e7d6b0 100%)`,
          boxShadow: `0 0 ${moonR * 0.6}px rgba(246,236,210,0.5)`,
        }}
      />
    </AbsoluteFill>
  );
};
