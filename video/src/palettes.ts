// Named visual palettes. Series identity is FORMAT, not colour — the layout,
// the bouncing ball, the sting and sign-off stay constant while the palette can
// change per song. Add a palette here and it appears in the Studio dropdown.
export type Palette = {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  moon: string;
  moonGlow: string;
  star: string;
  text: string;
  textShadow: string;
  dedication: string;
  charDim: string;
  ball: string;
  ballShadow: string;
  sectionTint: Record<string, string>;
};

// The lullaby night — warm, calm, low-contrast.
const night: Palette = {
  skyTop: "#243056",
  skyMid: "#182142",
  skyBottom: "#0c1024",
  moon: "#f6ecd2",
  moonGlow: "rgba(246, 236, 210, 0.55)",
  star: "#e9edff",
  text: "#f6f3ea",
  textShadow: "rgba(10, 14, 34, 0.7)",
  dedication: "#d3ba8f",
  charDim: "rgba(246, 243, 234, 0.34)",
  ball: "#ff5a5a",
  ballShadow: "rgba(255, 90, 90, 0.45)",
  sectionTint: {
    verse: "#fbf7ec",
    chorus: "#ffe9b8",
    bridge: "#e4f0e6",
    outro: "#f0e4f4",
  },
};

export const PALETTES = { night } satisfies Record<string, Palette>;
export const PALETTE_IDS = Object.keys(PALETTES) as (keyof typeof PALETTES)[];
