// Local Zen Maru Gothic — vendored so renders never touch the network.
//
// Previously both templates loaded the font via @remotion/google-fonts, which
// streams the woff2 from fonts.gstatic.com at render time. A transient DNS blip
// there failed a whole render batch. The TTFs now live in video/public/fonts/
// (tracked; see .gitignore) and are loaded from disk via staticFile, so a render
// works fully offline.
//
// Weights: 500 (Medium) · 700 (Bold) · 900 (Black) — the union both templates use.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fontFamily = "Zen Maru Gothic";

const WEIGHTS: { weight: string; file: string }[] = [
  { weight: "500", file: "fonts/ZenMaruGothic-Medium.ttf" },
  { weight: "700", file: "fonts/ZenMaruGothic-Bold.ttf" },
  { weight: "900", file: "fonts/ZenMaruGothic-Black.ttf" },
];

// Kick off loading at module load. loadFont registers the face with the document
// and blocks the render (via Remotion's font machinery) until it is ready.
export const fontsReady = Promise.all(
  WEIGHTS.map(({ weight, file }) =>
    loadFont({ family: fontFamily, url: staticFile(file), weight }),
  ),
);
