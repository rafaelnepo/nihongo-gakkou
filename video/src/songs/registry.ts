import type { SongTiming } from "../types";
import onajiTsuki from "../../timing/onaji-tsuki.json";

// Every song is a timing JSON. Add one line here and it becomes its own
// composition in Studio and a render target (npx remotion render <id>).
export const SONGS: { id: string; timing: SongTiming }[] = [
  { id: "onaji-tsuki", timing: onajiTsuki as SongTiming },
];

export const SONG_IDS = SONGS.map((s) => s.id);

export const getTiming = (songId: string): SongTiming => {
  const found = SONGS.find((s) => s.id === songId);
  if (!found) throw new Error(`Unknown songId: ${songId}`);
  return found.timing;
};
