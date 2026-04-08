export function formatMs(ms: number): string {
const totalSeconds = Math.max(0, Math.floor(ms / 1000));
const minutes = Math.floor(totalSeconds / 60);
const seconds = totalSeconds % 60;
return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function toMs(seconds: number): number {
return Math.round(seconds * 1000);
}

export function fromMs(ms: number): number {
return ms / 1000;
}

export function uid(prefix = "id"): string {
if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
return `${prefix}_${crypto.randomUUID()}`;
}

return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function downloadJson(filename: string, data: unknown) {
const blob = new Blob([JSON.stringify(data, null, 2)], {
type: "application/json",
});

const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();
URL.revokeObjectURL(url);
}
