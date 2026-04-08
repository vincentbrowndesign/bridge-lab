"use client";

import { MARKER_PRESETS } from "@/lib/constants";
import type { MarkerKind } from "@/lib/types";

type Props = {
onAddMarker: (kind: MarkerKind, label: string) => void;
};

export default function MarkerBar({ onAddMarker }: Props) {
return (
<section className="panel">
<div className="panelHeader">
<h3>Markers</h3>
<span className="muted">tap at current playhead</span>
</div>

<div className="markerGrid markerGridEight">
{MARKER_PRESETS.map((preset) => (
<button
key={preset.label}
type="button"
className="markerBtn"
onClick={() => onAddMarker(preset.kind, preset.label)}
>
{preset.label}
</button>
))}
</div>
</section>
);
}
