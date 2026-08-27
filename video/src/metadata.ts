import type { CalculateMetadataFunction } from "remotion";
import { staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import type { LearningProps, VideoProps } from "./schema";
import { getTiming } from "./songs/registry";
import { getLearningTiming } from "./songs/learning-registry";
import { durationInFramesOf, learningDurationInFrames } from "./types";

// Resolve the real video length from the AUDIO itself when present, so no song
// has to hand-set its duration. Falls back to the timing's own reckoning.
export const calculateMetadata: CalculateMetadataFunction<VideoProps> = async ({
  props,
}) => {
  const timing = getTiming(props.songId);
  let durationInFrames = durationInFramesOf(timing);
  if (timing.audio) {
    try {
      const seconds = await getAudioDurationInSeconds(staticFile(timing.audio));
      if (seconds && isFinite(seconds)) {
        durationInFrames = Math.round(seconds * timing.fps);
      }
    } catch {
      // keep the fallback
    }
  }
  return {
    durationInFrames,
    fps: timing.fps,
    width: timing.width,
    height: timing.height,
  };
};

// Same idea for the learning template: length from the audio when present.
export const calculateLearningMetadata: CalculateMetadataFunction<LearningProps> = async ({
  props,
}) => {
  const timing = getLearningTiming(props.songId);
  let durationInFrames = learningDurationInFrames(timing);
  if (timing.audio) {
    try {
      const seconds = await getAudioDurationInSeconds(staticFile(timing.audio));
      if (seconds && isFinite(seconds)) {
        durationInFrames = Math.round(seconds * timing.fps);
      }
    } catch {
      // keep the fallback
    }
  }
  return {
    durationInFrames,
    fps: timing.fps,
    width: timing.width,
    height: timing.height,
  };
};
