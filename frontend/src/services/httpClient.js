// Base URL comes from Vite env — set VITE_API_URL in .env (local dev) or in
// your Vercel project's environment variables (production).
// This is the ONLY place the backend origin is referenced.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * A normalized application-level error thrown by the API layer.
 * Components can rely on `.message` always being human-readable.
 */
export class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.cause = cause;
  }
}

/**
 * Thin fetch wrapper: resolves the backend URL, parses JSON safely,
 * and turns network/HTTP failures into a friendly ApiError so the UI
 * never has to deal with raw fetch exceptions.
 */
export async function request(path, { method = "GET", body, headers, signal } = {}) {
  const url = `${API_BASE_URL}${path}`;
  let response;

  try {
    response = await fetch(url, {
      method,
      headers: body instanceof FormData ? headers : { "Content-Type": "application/json", ...headers },
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(
      "Can't reach the backend. Make sure the API server is running and VITE_API_URL is correct.",
      { cause: err }
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const detail =
      (isJson && data && (data.detail || data.message)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(typeof detail === "string" ? detail : JSON.stringify(detail), {
      status: response.status,
    });
  }

  return data;
}
