import React from "react";
import { Composition } from "remotion";
import { LyricVideo } from "./LyricVideo";
import { LearningVideo } from "./LearningVideo";
import { videoSchema, learningSchema } from "./schema";
import {
  calculateMetadata,
  calculateLearningMetadata,
  calculateLearningMetadataVertical,
} from "./metadata";
import { SONGS } from "./songs/registry";
import { LEARNING_SONGS } from "./songs/learning-registry";
import { durationInFramesOf, learningDurationInFrames } from "./types";

// One <Composition> per song, all driven by the SAME template, schema and
// metadata. Adding a song is one line in songs/registry.ts. The id is also the
// render target: `npx remotion render aiueo-demo out.mp4`.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {SONGS.map(({ id, timing }) => (
        <Composition
          key={id}
          id={id}
          component={LyricVideo}
          schema={videoSchema}
          defaultProps={{
            songId: id,
            palette: "night",
            background: "night",
            showBall: true,
            showTitleCard: true,
          }}
          calculateMetadata={calculateMetadata}
          // Fallbacks shown before calculateMetadata resolves the real length.
          durationInFrames={durationInFramesOf(timing)}
          fps={timing.fps}
          width={timing.width}
          height={timing.height}
        />
      ))}

      {LEARNING_SONGS.map(({ id, timing }) => (
        <Composition
          key={id}
          id={id}
          component={LearningVideo}
          schema={learningSchema}
          defaultProps={{ songId: id }}
          calculateMetadata={calculateLearningMetadata}
          durationInFrames={learningDurationInFrames(timing)}
          fps={timing.fps}
          width={timing.width}
          height={timing.height}
        />
      ))}

      {/* Vertical (9:16) cut of each learning song — same template, re-flowed. */}
      {LEARNING_SONGS.map(({ id, timing }) => (
        <Composition
          key={`${id}-vertical`}
          id={`${id}-vertical`}
          component={LearningVideo}
          schema={learningSchema}
          defaultProps={{ songId: id }}
          calculateMetadata={calculateLearningMetadataVertical}
          durationInFrames={learningDurationInFrames(timing)}
          fps={timing.fps}
          width={1080}
          height={1920}
        />
      ))}
    </>
  );
};
