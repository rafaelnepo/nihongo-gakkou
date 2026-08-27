export type Section = "verse" | "chorus" | "bridge" | "outro";

export type CharTime = {
  start: number; // seconds
  end: number; // seconds
};

export type LyricLine = {
  text: string;
  start: number; // seconds
  end: number; // seconds
  section: Section;
  // Optional manual shift (seconds) for THIS line only — added to its start/end
  // and every char. Use when the song pauses/holds and one line drifts against
  // the voice, without re-running alignment.
  delay?: number;
  // Optional per-DISPLAY-character timings (one entry per Array.from(text) glyph,
  // spaces and punctuation included). Produced by WhisperX forced alignment.
  // When absent, the template distributes glyphs evenly across [start, end].
  chars?: CharTime[];
};

export type SongTiming = {
  song: string;
  title: string;
  dedication?: string;
  fps: number;
  width: number;
  height: number;
  audio: string | null;
  placeholder: boolean;
  durationSeconds?: number; // when audio exists, pin the video to its exact length
  // Global sync nudge for ALL lyrics/ball, in seconds. Positive = lyrics later,
  // negative = lyrics earlier. Use this when the ball is consistently ahead of
  // or behind the voice. Does not move the audio.
  offsetSeconds?: number;
  titleCard: { start: number; end: number };
  tailSeconds: number;
  lines: LyricLine[];
};

export const durationInFramesOf = (t: SongTiming): number => {
  // Once there's real audio, the audio's length is the truth.
  if (t.durationSeconds) return Math.round(t.durationSeconds * t.fps);
  const lastEnd = t.lines.reduce((m, l) => Math.max(m, l.end), t.titleCard.end);
  return Math.round((lastEnd + t.tailSeconds) * t.fps);
};
