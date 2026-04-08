import type { SessionArchive } from "./types";

export function exportSessionForModel(session: SessionArchive) {
  return {
    session_id: session.sessionId,
    session_name: session.sessionName,
    created_at: session.createdAt,
    duration_ms: session.durationMs,
    events: session.markers.map((marker) => ({
      t_ms: marker.atMs,
      tag: marker.tag,
      label: marker.label,
      note: marker.note || null,
    })),
    sequences: session.sequences.map((sequence) => ({
      start_ms: sequence.startMs,
      end_ms: sequence.endMs,
      pattern: sequence.markers.map((marker) => marker.tag),
      labels: sequence.markers.map((marker) => marker.label),
    })),
  };
}