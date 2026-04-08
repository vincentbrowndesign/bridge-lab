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

export interface SessionArchive {
session: {
id: string;
name: string;
durationMs: number;
createdAt: string;
};
summary: {
catch: number;
drive: number;
pass: number;
shot: number;
make: number;
miss: number;
turnover: number;
stop: number;
shotAttempts: number;
fg: number;
};
insights: string[];
markers: Marker[];
sequences: Sequence[];
}
