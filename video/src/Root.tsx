import React from "react";
import { Composition } from "remotion";
import { LyricVideo } from "./LyricVideo";
import { videoSchema } from "./schema";
import { calculateMetadata } from "./metadata";
import { SONGS } from "./songs/registry";
import { durationInFramesOf } from "./types";

// One <Composition> per song, all driven by the SAME template, schema and
// metadata. Adding a song is one line in songs/registry.ts. The id is also the
// render target: `npx remotion render onaji-tsuki out.mp4`.
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
    </>
  );
};
