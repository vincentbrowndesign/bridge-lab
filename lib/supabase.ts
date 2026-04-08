import { createClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET_DATA, STORAGE_BUCKET_VIDEOS } from "./constants";
import { exportSessionForModel } from "./exportModelData";
import type {
  Marker,
  Sequence,
  SessionVideo,
  UploadedSessionResult,
} from "./types";
import { safeFileName } from "./utils";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

function getPublicUrl(bucket: string, path: string): string | null {
  if (!supabase) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl ?? null;
}

export async function uploadSessionBundle(params: {
  session: SessionVideo;
  markers: Marker[];
  sequences: Sequence[];
  summary: Record<string, unknown>;
  insights: string[];
}): Promise<UploadedSessionResult> {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
    );
  }

  const { session, markers, sequences, summary, insights } = params;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const base = safeFileName(session.name || "session");

  const videoExt = session.file.name.split(".").pop() || "mp4";
  const videoPath = `${base}/${stamp}/session.${videoExt}`;
  const dataPath = `${base}/${stamp}/archive.json`;

  const uploadVideo = await supabase.storage
    .from(STORAGE_BUCKET_VIDEOS)
    .upload(videoPath, session.file, {
      upsert: false,
      contentType: session.file.type || "video/mp4",
    });

  if (uploadVideo.error) {
    throw new Error(uploadVideo.error.message);
  }

  const archivePayload = {
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
    model: exportSessionForModel({
      sessionId: session.id,
      sessionName: session.name,
      createdAt: session.createdAt,
      durationMs: session.durationMs,
      markers,
      sequences,
    }),
  };

  const archiveBlob = new Blob([JSON.stringify(archivePayload, null, 2)], {
    type: "application/json",
  });

  const uploadData = await supabase.storage
    .from(STORAGE_BUCKET_DATA)
    .upload(dataPath, archiveBlob, {
      upsert: false,
      contentType: "application/json",
    });

  if (uploadData.error) {
    throw new Error(uploadData.error.message);
  }

  return {
    videoPath,
    videoPublicUrl: getPublicUrl(STORAGE_BUCKET_VIDEOS, videoPath),
    dataPath,
    dataPublicUrl: getPublicUrl(STORAGE_BUCKET_DATA, dataPath),
  };
}