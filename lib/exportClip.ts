type ExportClipArgs = {
video: HTMLVideoElement;
startMs: number;
endMs: number;
filename?: string;
};

function waitForSeek(video: HTMLVideoElement, time: number) {
return new Promise<void>((resolve) => {
const handler = () => {
video.removeEventListener("seeked", handler);
resolve();
};
video.addEventListener("seeked", handler);
video.currentTime = time;
});
}

export async function exportClip({
video,
startMs,
endMs,
filename = "clip.webm",
}: ExportClipArgs) {
if (endMs <= startMs) return;

const canvas = document.createElement("canvas");
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const ctx = canvas.getContext("2d");
if (!ctx) return; // ✅ THIS FIXES YOUR ERROR

const stream = canvas.captureStream();

const recorder = new MediaRecorder(stream, {
mimeType: "video/webm",
});

const chunks: BlobPart[] = [];

recorder.ondataavailable = (e) => {
if (e.data.size > 0) chunks.push(e.data);
};

const stopped = new Promise<void>((resolve) => {
recorder.onstop = () => resolve();
});

const start = startMs / 1000;
const end = endMs / 1000;

const prevTime = video.currentTime;
const wasPaused = video.paused;

await waitForSeek(video, start);

recorder.start();

try {
await video.play();

await new Promise<void>((resolve) => {
function draw() {
// ✅ SAFE — ctx is guaranteed
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

if (video.currentTime >= end || video.ended) {
resolve();
return;
}

requestAnimationFrame(draw);
}

draw();
});
} finally {
video.pause();
recorder.stop();
}

await stopped;

await waitForSeek(video, prevTime);

if (!wasPaused) {
video.play().catch(() => {});
}

const blob = new Blob(chunks, { type: "video/webm" });
const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();

setTimeout(() => URL.revokeObjectURL(url), 1000);
}
