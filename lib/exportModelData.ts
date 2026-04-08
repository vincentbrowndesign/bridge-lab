import type { SessionArchive } from "./types";

export function exportSessionForModel(session: SessionArchive) {
return {
session: session.session,
summary: session.summary,
insights: session.insights,
markers: session.markers.map((marker) => ({
id: marker.id,
kind: marker.kind,
tag: marker.tag,
label: marker.label,
atMs: marker.atMs,
note: marker.note ?? "",
})),
sequences: session.sequences.map((sequence) => ({
id: sequence.id,
startMs: sequence.startMs,
endMs: sequence.endMs,
label: sequence.label,
labels: sequence.markers.map((marker) => marker.label),
tags: sequence.markers.map((marker) => marker.tag),
})),
};
}
