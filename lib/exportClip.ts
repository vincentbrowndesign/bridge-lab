type ExportClipArgs = {
video: HTMLVideoElement;
startMs: number;
endMs: number;
filename?: string;
};

function waitForSeek(video: HTMLVideoElement, timeSeconds: number) {
return new Promise<void>((resolve, reject) => {
const onSeeked = () => {
cleanup();
resolve();
};

const onError = () => {
cleanup();
reject(new Error("Video seek failed."));
};

const cleanup = () => {
video.removeEventListener("seeked", onSeeked);
video.removeEventListener("error", onError);
};

video.addEventListener("seeked", onSeeked, { once: true });
video.addEventListener("error", onError, { once: true });
video.currentTime = timeSeconds;
});
}

export async function exportClip({
video,
startMs,
endMs,
filename = "sequence.webm",
}: ExportClipArgs) {
if (!video.videoWidth || !video.videoHeight) {
throw new Error("Video metadata is not ready yet.");
}

if (endMs <= startMs) {
throw new Error("Invalid clip range.");
}

const canvas = document.createElement("canvas");
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const ctx = canvas.getContext("2d");
if (!ctx) {
throw new Error("Canvas context unavailable.");
}

const stream = canvas.captureStream();
const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
? "video/webm;codecs=vp9"
: "video/webm";

const recorder = new MediaRecorder(stream, { mimeType });
const chunks: BlobPart[] = [];

recorder.ondataavailable = (event) => {
if (event.data.size > 0) {
chunks.push(event.data);
}
};

const stopped = new Promise<void>((resolve) => {
recorder.onstop = () => resolve();
});

const startSeconds = startMs / 1000;
const endSeconds = endMs / 1000;

const wasPaused = video.paused;
const previousTime = video.currentTime;

await waitForSeek(video, startSeconds);

recorder.start(100);

try {
await video.play();

await new Promise<void>((resolve) => {
function draw() {
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

if (video.currentTime >= endSeconds || video.ended) {
resolve();
return;
}

requestAnimationFrame(draw);
}

draw();
});
} finally {
video.pause();
if (recorder.state !== "inactive") {
recorder.stop();
}
}

await stopped;

await waitForSeek(video, previousTime);
if (!wasPaused) {
video.play().catch(() => undefined);
}

const blob = new Blob(chunks, { type: mimeType });
const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();

setTimeout(() => URL.revokeObjectURL(url), 1000);
}
