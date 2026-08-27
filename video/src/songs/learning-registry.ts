import type { LearningTiming } from "../types";
import aiueo from "../../timing/01-aiueo.learning.json";

// Learning songs use the LearningVideo template (cream, two-line, orbiting art).
// Add a song: build its timing (tools/build_learning_timing.mjs → align) and add
// one line here. The id is the render target: `npx remotion render 01-aiueo`.
export const LEARNING_SONGS: { id: string; timing: LearningTiming }[] = [
  { id: "01-aiueo", timing: aiueo as LearningTiming },
];

export const LEARNING_IDS = LEARNING_SONGS.map((s) => s.id);

export const getLearningTiming = (songId: string): LearningTiming => {
  const found = LEARNING_SONGS.find((s) => s.id === songId);
  if (!found) throw new Error(`Unknown learning songId: ${songId}`);
  return found.timing;
};
