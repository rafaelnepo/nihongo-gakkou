import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Codec is chosen per-render on the CLI (h264 default). Left unset here.
