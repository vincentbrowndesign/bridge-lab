import type { MarkerKind } from "./types";

export const APP_TITLE = "Bridge Lab";

export const ACCEPTED_VIDEO_TYPES = [
"video/mp4",
"video/quicktime",
"video/x-m4v",
"video/webm",
];

export const MARKER_PRESETS: Array<{ kind: MarkerKind; label: string }> = [
{ kind: "action", label: "Catch" },
{ kind: "action", label: "Drive" },
{ kind: "action", label: "Pass" },
{ kind: "action", label: "Shot" },
{ kind: "make", label: "Make" },
{ kind: "miss", label: "Miss" },
{ kind: "turnover", label: "Turnover" },
{ kind: "stop", label: "Stop" },
];