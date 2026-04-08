import type { Marker, Sequence } from "./types";
import { uid } from "./utils";

const MAX_GAP_MS = 4000;

export function buildSequences(markers: Marker[]): Sequence[] {
if (markers.length === 0) return [];

const sorted = [...markers].sort((a, b) => a.atMs - b.atMs);
const sequences: Sequence[] = [];

let current: Marker[] = [sorted[0]];

for (let i = 1; i < sorted.length; i += 1) {
const prev = sorted[i - 1];
const curr = sorted[i];

if (curr.atMs - prev.atMs <= MAX_GAP_MS) {
current.push(curr);
} else {
sequences.push(makeSequence(current));
current = [curr];
}
}

sequences.push(makeSequence(current));
return sequences;
}

function makeSequence(markers: Marker[]): Sequence {
return {
id: uid("seq"),
startMs: markers[0].atMs,
endMs: markers[markers.length - 1].atMs,
markers,
label: markers.map((marker) => marker.label).join(" → "),
};
}
