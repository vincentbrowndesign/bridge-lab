"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Marker, SessionVideo } from "@/lib/types";
import { formatMs, fromMs } from "@/lib/utils";

type Props = {
session: SessionVideo;
markers: Marker[];
currentMs: number;
onTimeChange: (ms: number) => void;
onVideoReady?: (node: HTMLVideoElement | null) => void;
};

export default function SessionPlayer({
session,
markers,
currentMs,
onTimeChange,
onVideoReady,
}: Props) {
const ref = useRef<HTMLVideoElement | null>(null);
const [isPlaying, setIsPlaying] = useState(false);

const sortedMarkers = useMemo(
() => [...markers].sort((a, b) => a.atMs - b.atMs),
[markers]
);

useEffect(() => {
onVideoReady?.(ref.current);
return () => onVideoReady?.(null);
}, [onVideoReady, session.id]);

useEffect(() => {
const video = ref.current;
if (!video) return;

const onPlay = () => setIsPlaying(true);
const onPause = () => setIsPlaying(false);

video.addEventListener("play", onPlay);
video.addEventListener("pause", onPause);

return () => {
video.removeEventListener("play", onPlay);
video.removeEventListener("pause", onPause);
};
}, []);

useEffect(() => {
const video = ref.current;
if (!video) return;

const nextSeconds = fromMs(currentMs);
if (Math.abs(video.currentTime - nextSeconds) > 0.12) {
video.currentTime = nextSeconds;
}
}, [currentMs]);

function seekTo(ms: number) {
const video = ref.current;
if (!video) return;

const clamped = Math.max(0, Math.min(session.durationMs, ms));
video.currentTime = fromMs(clamped);
onTimeChange(clamped);
}

function togglePlay() {
const video = ref.current;
if (!video) return;

if (video.paused) {
video.play().catch(() => undefined);
} else {
video.pause();
}
}

const progress =
session.durationMs > 0 ? (currentMs / session.durationMs) * 100 : 0;

return (
<section className="panel">
<div className="panelHeader sessionHeader">
<h3>Session Video</h3>
<span className="muted sessionMeta">
{session.name} · {formatMs(session.durationMs)}
</span>
</div>

<div className="videoShell">
<video
ref={ref}
className="sessionVideo"
src={session.objectUrl}
playsInline
preload="metadata"
controls={false}
disablePictureInPicture
controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
onClick={togglePlay}
onLoadedMetadata={() => onVideoReady?.(ref.current)}
onTimeUpdate={(e) =>
onTimeChange(Math.round(e.currentTarget.currentTime * 1000))
}
/>

<button
type="button"
className="videoOverlayButton"
onClick={togglePlay}
aria-label={isPlaying ? "Pause video" : "Play video"}
>
{isPlaying ? "Pause" : "Play"}
</button>
</div>

<div className="playheadRow">
<div className="playheadNow">Playhead: {formatMs(currentMs)}</div>

<div className="transportRow">
<button
type="button"
className="ghostBtn transportBtn"
onClick={() => seekTo(currentMs - 3000)}
>
-3s
</button>

<button
type="button"
className="ghostBtn transportBtn"
onClick={() => seekTo(currentMs + 3000)}
>
+3s
</button>
</div>
</div>

<div
className="axisTimeline"
onClick={(e) => {
const rect = e.currentTarget.getBoundingClientRect();
const ratio = (e.clientX - rect.left) / rect.width;
const nextMs = Math.round(ratio * session.durationMs);
seekTo(nextMs);
}}
>
<div className="axisTimelineTrack" />
<div className="axisTimelineProgress" style={{ width: `${progress}%` }} />

{sortedMarkers.map((marker) => {
const left =
session.durationMs > 0 ? (marker.atMs / session.durationMs) * 100 : 0;

return (
<button
key={marker.id}
type="button"
title={`${marker.label} @ ${formatMs(marker.atMs)}`}
className="axisTimelineMarker"
style={{ left: `${left}%` }}
onClick={(e) => {
e.stopPropagation();
seekTo(marker.atMs);
}}
/>
);
})}

<div className="axisTimelinePlayhead" style={{ left: `${progress}%` }} />
</div>
</section>
);
}
