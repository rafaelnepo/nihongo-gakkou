import type { LearningTiming } from "../types";
import { GENERATED_LEARNING_SONGS } from "./learning-registry.generated";

// The song LIST is GENERATED from video/timing/*.learning.json by
// tools/gen_registry.mjs — do NOT hand-edit it. Add a song by building its timing
// (tools/build_learning_timing.mjs <id> → tools/align) and running the generator;
// the id is the render target, e.g. `npx remotion render 01-aiueo`.
export const LEARNING_SONGS: { id: string; timing: LearningTiming }[] =
  GENERATED_LEARNING_SONGS;

export const LEARNING_IDS = LEARNING_SONGS.map((s) => s.id);

export const getLearningTiming = (songId: string): LearningTiming => {
  const found = LEARNING_SONGS.find((s) => s.id === songId);
  if (!found) throw new Error(`Unknown learning songId: ${songId}`);
  return found.timing;
};
