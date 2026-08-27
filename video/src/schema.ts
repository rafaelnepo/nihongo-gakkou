import { z } from "zod";
import { PALETTE_IDS } from "./palettes";
import { SONG_IDS } from "./songs/registry";

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
