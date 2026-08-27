import { z } from "zod";
import { PALETTE_IDS } from "./palettes";
import { SONG_IDS } from "./songs/registry";
import { LEARNING_IDS } from "./songs/learning-registry";

// The composition's editable props. These show up as controls in Remotion
// Studio's schema editor — change the song, palette, or background without code.
// The timing itself is resolved from `songId` (see songs/registry.ts); it is
// data, not a hand-edited prop.
export const videoSchema = z.object({
  songId: z.enum(SONG_IDS as [string, ...string[]]),
  palette: z.enum(PALETTE_IDS as [string, ...string[]]).default("night"),
  background: z.enum(["night"]).default("night"),
  showBall: z.boolean().default(true),
  showTitleCard: z.boolean().default(true),
});

export type VideoProps = z.infer<typeof videoSchema>;

// Learning videos (LearningVideo.tsx) — a separate template; the only prop is the
// song, whose timing carries everything else (cream world is fixed).
export const learningSchema = z.object({
  songId: z.enum(LEARNING_IDS as [string, ...string[]]),
});

export type LearningProps = z.infer<typeof learningSchema>;
