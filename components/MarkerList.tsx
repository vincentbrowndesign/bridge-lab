"use client";

import { useState } from "react";
import type { Marker } from "@/lib/types";
import { formatMs } from "@/lib/utils";

type Props = {
markers: Marker[];
onJump: (atMs: number) => void;
onDelete: (markerId: string) => void;
onUpdateNote: (markerId: string, note: string) => void;
};

export default function MarkerList({
markers,
onJump,
onDelete,
onUpdateNote,
}: Props) {
const [editingId, setEditingId] = useState<string | null>(null);
const [draftNote, setDraftNote] = useState("");

function startEditing(markerId: string, currentNote: string) {
setEditingId(markerId);
setDraftNote(currentNote);
}

function finishEditing(markerId: string) {
onUpdateNote(markerId, draftNote.trim());
setEditingId(null);
setDraftNote("");
}

return (
<section className="panel">
<div className="panelHeader">
<h3>Marker Log</h3>
<span className="muted">{markers.length} total</span>
</div>

{markers.length === 0 ? (
<div className="emptyState">No markers yet.</div>
) : (
<div className="markerLogStack">
{markers.map((marker) => (
<div key={marker.id} className="markerLogCard">
<div className="markerLogTop">
<button
type="button"
className="timePill compactTime"
onClick={() => onJump(marker.atMs)}
>
{formatMs(marker.atMs)}
</button>

<button
type="button"
className="dangerBtn compactDelete"
onClick={() => onDelete(marker.id)}
>
Delete
</button>
</div>

<div className="markerLabel">{marker.label}</div>

{editingId === marker.id ? (
<input
className="noteInput"
value={draftNote}
onChange={(e) => setDraftNote(e.target.value)}
onBlur={() => finishEditing(marker.id)}
onKeyDown={(e) => {
if (e.key === "Enter") finishEditing(marker.id);
if (e.key === "Escape") {
setEditingId(null);
setDraftNote("");
}
}}
placeholder="Add note"
autoFocus
/>
) : (
<button
type="button"
className="noteButton"
onClick={() => startEditing(marker.id, marker.note || "")}
>
{marker.note?.trim() ? marker.note : "Add note"}
</button>
)}
</div>
))}
</div>
)}
</section>
);
}
