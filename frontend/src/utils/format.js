/** Formats an ISO date string into a short, human-readable date. */
export function formatDate(dateInput) {
  if (!dateInput) return "Unknown date";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Formats a byte count into a readable file size. */
export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

/** Formats milliseconds into a compact latency string (e.g. 842 ms, 1.2 s). */
export function formatLatency(ms) {
  if (ms === undefined || ms === null) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/** Clamps and formats a relevance score (0–1) as a percentage. */
export function formatScore(score) {
  if (score === undefined || score === null) return "—";
  const pct = Math.max(0, Math.min(1, score)) * 100;
  return `${pct.toFixed(1)}%`;
}

/** Truncates text to a max length, breaking on a word boundary. */
export function truncate(text, max = 220) {
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}
