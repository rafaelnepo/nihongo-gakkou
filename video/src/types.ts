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

// ============================================================================
// Learning videos — a different template (LearningVideo.tsx): warm-cream ground,
// two lines at a time (current fills red, next waits in grey), illustrations
// orbiting the verse, corner metadata, a count-in and a small audio visualizer.
// Same timing discipline: WhisperX fills start/end + chars[]; text is screen form.
export type LearningSection =
  | "intro" | "verse" | "refrain" | "bridge" | "review" | "outro";

export type LearningLine = {
  text: string;
  start: number; // seconds
  end: number; // seconds
  chars?: CharTime[]; // per-display-char timings from alignment; else even-split
  section: LearningSection;
  illos?: string[]; // romaji keys -> <ilBase>/<key>.png, orbiting during this line
  target?: string; // romaji of the word being taught on this line
  // Quick manual nudge (seconds) for THIS line only — shifts its in/out and its
  // whole karaoke fill together. + = later, - = earlier. For fine work, edit
  // `start`/`end` directly; for uniform drift use the timing's `offsetSeconds`.
  delay?: number;
};

export type LearningTiming = {
  song: string;
  title: string; // the song's kana title
  trackName: string; // song name (hiragana) in the media-player strip
  trackNo: string; // track number shown in the player, e.g. "03"
  row: string; // the gojuon row being practiced, e.g. "AIUEO"
  channel: string; // brand (the logo mark sits top-right)
  style: string; // corner (bottom-left, with bpm)
  bpm: number;
  ilBase: string; // e.g. "il/01-aiueo" under public/
  fps: number;
  width: number;
  height: number;
  audio: string; // learning videos always have audio (under public/)
  placeholder: boolean; // true = TIMING is unaligned (audio still plays)
  durationSeconds?: number;
  offsetSeconds?: number; // global sync nudge (+ = lyrics later)
  countInSeconds?: number; // dots count-in before the first line
  tailSeconds: number;
  lines: LearningLine[];
};

export const learningDurationInFrames = (t: LearningTiming): number => {
  if (t.durationSeconds) return Math.round(t.durationSeconds * t.fps);
  const lastEnd = t.lines.reduce((m, l) => Math.max(m, l.end), 0);
  return Math.round((lastEnd + t.tailSeconds) * t.fps);
};
