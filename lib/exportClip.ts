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
if (endMs <= startMs) {
throw new Error("Invalid clip range.");
}

if (!video.videoWidth || !video.videoHeight) {
throw new Error("Video metadata is not ready.");
}

const canvas = document.createElement("canvas");
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const maybeContext = canvas.getContext("2d");
if (maybeContext === null) {
throw new Error("Canvas context not available.");
}

const context: CanvasRenderingContext2D = maybeContext;

const stream = canvas.captureStream();
const recorder = new MediaRecorder(stream, {
mimeType: "video/webm",
});

const chunks: BlobPart[] = [];

recorder.ondataavailable = (event) => {
if (event.data.size > 0) {
chunks.push(event.data);
}
};

const stopped = new Promise<void>((resolve) => {
recorder.onstop = () => resolve();
});

const start = startMs / 1000;
const end = endMs / 1000;

const previousTime = video.currentTime;
const wasPaused = video.paused;

await waitForSeek(video, start);

recorder.start();

try {
await video.play();

await new Promise<void>((resolve) => {
function draw() {
context.drawImage(video, 0, 0, canvas.width, canvas.height);

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

if (recorder.state !== "inactive") {
recorder.stop();
}
}

await stopped;
await waitForSeek(video, previousTime);

if (!wasPaused) {
video.play().catch(() => undefined);
}

const blob = new Blob(chunks, { type: "video/webm" });
const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();

setTimeout(() => {
URL.revokeObjectURL(url);
}, 1000);
}
