import type { SongTiming } from "../types";
import aiueoDemo from "../../timing/aiueo-demo.json";

// Every song is a timing JSON. Add one line here and it becomes its own
// composition in Studio and a render target (npx remotion render <id>).
// Private songs are kept local only (their timing JSON is git-ignored); add
// them to this list locally when working on them.
export const SONGS: { id: string; timing: SongTiming }[] = [
  { id: "aiueo-demo", timing: aiueoDemo as SongTiming },
];

export const SONG_IDS = SONGS.map((s) => s.id);

export const getTiming = (songId: string): SongTiming => {
  const found = SONGS.find((s) => s.id === songId);
  if (!found) throw new Error(`Unknown songId: ${songId}`);
  return found.timing;
};
