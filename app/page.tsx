"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import MarkerBar from "@/components/MarkerBar";
import MarkerList from "@/components/MarkerList";
import SequenceCard from "@/components/SequenceCard";
import SessionPlayer from "@/components/SessionPlayer";
import { ACCEPTED_VIDEO_TYPES, APP_TITLE } from "@/lib/constants";
import { exportClip } from "@/lib/exportClip";
import { buildSequences } from "@/lib/sequenceEngine";
import type { Marker, MarkerKind, Sequence, SessionVideo } from "@/lib/types";
import { downloadJson, toMs, uid } from "@/lib/utils";

export default function Page() {
const [session, setSession] = useState<SessionVideo | null>(null);
const [markers, setMarkers] = useState<Marker[]>([]);
const [currentMs, setCurrentMs] = useState(0);
const [status, setStatus] = useState("");
const videoRef = useRef<HTMLVideoElement | null>(null);

useEffect(() => {
return () => {
if (session?.objectUrl) {
URL.revokeObjectURL(session.objectUrl);
}
};
}, [session]);

const sequences = useMemo(() => buildSequences(markers), [markers]);

const summary = useMemo(() => {
const counts = {
catch: 0,
drive: 0,
pass: 0,
shot: 0,
make: 0,
miss: 0,
turnover: 0,
stop: 0,
};

for (const marker of markers) {
counts[marker.tag] += 1;
}

const shotAttempts = counts.make + counts.miss;
const fg = shotAttempts > 0 ? Math.round((counts.make / shotAttempts) * 100) : 0;

return {
...counts,
shotAttempts,
fg,
};
}, [markers]);

const insights = useMemo(() => {
const lines: string[] = [];

if (summary.catch > 0) lines.push(`${summary.catch} catches logged`);
if (summary.drive > 0) lines.push(`${summary.drive} drives logged`);
if (summary.pass > 0) lines.push(`${summary.pass} passes logged`);
if (summary.shot > 0) lines.push(`${summary.shot} shots logged`);
if (summary.shotAttempts > 0) lines.push(`${summary.fg}% on tagged shot results`);
if (sequences.length > 0) lines.push(`${sequences.length} sequences built`);

return lines;
}, [summary, sequences]);

async function loadVideoMeta(file: File) {
const objectUrl = URL.createObjectURL(file);

const durationMs = await new Promise<number>((resolve, reject) => {
const video = document.createElement("video");
video.preload = "metadata";
video.src = objectUrl;
video.onloadedmetadata = () => resolve(toMs(video.duration || 0));
video.onerror = () => reject(new Error("Could not read video metadata."));
});

if (session?.objectUrl) {
URL.revokeObjectURL(session.objectUrl);
}

setSession({
id: uid("session"),
file,
name: file.name,
objectUrl,
durationMs,
createdAt: new Date().toISOString(),
});

setMarkers([]);
setCurrentMs(0);
setStatus("");
}

async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
const file = e.target.files?.[0];
if (!file) return;

if (file.type && !ACCEPTED_VIDEO_TYPES.includes(file.type)) {
setStatus(`Unsupported file type: ${file.type}`);
return;
}

try {
await loadVideoMeta(file);
} catch (error) {
setStatus(error instanceof Error ? error.message : "Failed to load video.");
}
}

function addMarker(kind: MarkerKind, label: string) {
if (!session) return;

const marker: Marker = {
id: uid("marker"),
kind,
tag: label.toLowerCase() as Marker["tag"],
label,
atMs: currentMs,
createdAt: new Date().toISOString(),
note: "",
};

setMarkers((prev) =>
[...prev, marker].sort(
(a, b) => a.atMs - b.atMs || a.createdAt.localeCompare(b.createdAt)
)
);
}

function deleteMarker(markerId: string) {
setMarkers((prev) => prev.filter((marker) => marker.id !== markerId));
}

function updateMarkerNote(markerId: string, note: string) {
setMarkers((prev) =>
prev.map((marker) =>
marker.id === markerId ? { ...marker, note } : marker
)
);
}

function jumpTo(ms: number) {
setCurrentMs(ms);
}

function exportArchiveJson() {
if (!session) return;

const payload = {
session: {
id: session.id,
name: session.name,
durationMs: session.durationMs,
createdAt: session.createdAt,
},
summary,
insights,
markers,
sequences,
};

downloadJson(`${session.name.replace(/\.[^.]+$/, "")}-archive.json`, payload);
}

async function handleExportSequence(sequence: Sequence) {
const video = videoRef.current;

if (!video) {
setStatus("Video player is not ready.");
return;
}

try {
setStatus(`Exporting clip ${sequence.label}...`);

await exportClip({
video,
startMs: sequence.startMs,
endMs: sequence.endMs,
filename: `${session?.name.replace(/\.[^.]+$/, "") || "session"}-${sequence.label
.toLowerCase()
.replace(/\s+/g, "-")}-${Math.floor(sequence.startMs / 1000)}-${Math.floor(
sequence.endMs / 1000
)}.webm`,
});

setStatus("Clip exported.");
} catch (error) {
setStatus(error instanceof Error ? error.message : "Clip export failed.");
}
}

return (
<main className="pageShell">
<header className="hero">
<div>
<div className="eyebrow">{APP_TITLE}</div>
<h1>Visual Performance Notebook</h1>
<p className="heroText">
Import one long session video. Mark the truth. Build sequences,
export clips, archive sessions, and create model-ready basketball data.
</p>
</div>

<div className="heroActions">
<label className="uploadBtn">
Import Session Video
<input
type="file"
accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
onChange={onFileChange}
hidden
/>
</label>

<button
type="button"
className="ghostBtn"
onClick={exportArchiveJson}
disabled={!session}
>
Export Archive JSON
</button>
</div>
</header>

{status ? <div className="statusBar">{status}</div> : null}

{!session ? (
<section className="emptyHero">
<div className="emptyBox">
<h2>No session loaded</h2>
<p>Record with the native phone camera first, then import the long file here.</p>
</div>
</section>
) : (
<div className="mainStack">
<SessionPlayer
session={session}
markers={markers}
currentMs={currentMs}
onTimeChange={setCurrentMs}
onVideoReady={(node) => {
videoRef.current = node;
}}
/>

<MarkerBar onAddMarker={addMarker} />

<section className="panel">
<div className="panelHeader">
<h3>Pattern Summary</h3>
<span className="muted">live from markers</span>
</div>

<div className="summaryGrid">
<div className="statCard">
<div className="statLabel">Catch</div>
<div className="statValue">{summary.catch}</div>
</div>
<div className="statCard">
<div className="statLabel">Drive</div>
<div className="statValue">{summary.drive}</div>
</div>
<div className="statCard">
<div className="statLabel">Pass</div>
<div className="statValue">{summary.pass}</div>
</div>
<div className="statCard">
<div className="statLabel">Shot</div>
<div className="statValue">{summary.shot}</div>
</div>
<div className="statCard">
<div className="statLabel">Make</div>
<div className="statValue">{summary.make}</div>
</div>
<div className="statCard">
<div className="statLabel">Miss</div>
<div className="statValue">{summary.miss}</div>
</div>
<div className="statCard">
<div className="statLabel">Turnover</div>
<div className="statValue">{summary.turnover}</div>
</div>
<div className="statCard">
<div className="statLabel">FG%</div>
<div className="statValue">{summary.fg}%</div>
</div>
</div>

{insights.length > 0 ? (
<div className="insightList">
{insights.map((line) => (
<div key={line} className="insightItem">
{line}
</div>
))}
</div>
) : null}
</section>

<section className="panel">
<div className="panelHeader">
<h3>Sequences</h3>
<span className="muted">{sequences.length} total</span>
</div>

{sequences.length === 0 ? (
<div className="emptyState">Add markers to build sequences.</div>
) : (
<div className="stack">
{sequences.map((sequence) => (
<SequenceCard
key={sequence.id}
sequence={sequence}
onJump={jumpTo}
onExport={handleExportSequence}
/>
))}
</div>
)}
</section>

<MarkerList
markers={markers}
onJump={jumpTo}
onDelete={deleteMarker}
onUpdateNote={updateMarkerNote}
/>
</div>
)}
</main>
);
}
