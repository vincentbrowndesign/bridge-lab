export type MarkerKind =
| "action"
| "make"
| "miss"
| "turnover"
| "stop";

export type EventTag =
| "catch"
| "drive"
| "pass"
| "shot"
| "make"
| "miss"
| "turnover"
| "stop";

export interface Marker {
id: string;
kind: MarkerKind;
tag: EventTag;
label: string;
atMs: number;
createdAt: string;
note?: string;
}

export interface Sequence {
id: string;
startMs: number;
endMs: number;
markers: Marker[];
label: string;
}

export interface SessionVideo {
id: string;
file: File;
name: string;
objectUrl: string;
durationMs: number;
createdAt: string;
}
