"use client";

import type { Sequence } from "@/lib/types";
import { formatMs } from "@/lib/utils";

type Props = {
sequence: Sequence;
onJump: (ms: number) => void;
onExport: (sequence: Sequence) => void;
};

export default function SequenceCard({
sequence,
onJump,
onExport,
}: Props) {
return (
<div className="sequenceCard">
<div className="sequenceHeader">
<div className="sequenceTime">
{formatMs(sequence.startMs)} → {formatMs(sequence.endMs)}
</div>
<div className="sequenceLabel">{sequence.label}</div>
</div>

<div className="sequenceFlow">
{sequence.markers.map((m, i) => (
<span key={m.id}>
{m.label}
{i < sequence.markers.length - 1 ? " → " : ""}
</span>
))}
</div>

<div className="sequenceActions">
<button
type="button"
className="jumpBtn"
onClick={() => onJump(sequence.startMs)}
>
Jump to start
</button>

<button
type="button"
className="exportBtn"
onClick={() => onExport(sequence)}
>
Export Clip
</button>
</div>
</div>
);
}