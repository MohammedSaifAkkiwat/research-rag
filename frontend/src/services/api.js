import { request, API_BASE_URL } from "./httpClient";

/**
 * ────────────────────────────────────────────────────────────────────────
 * Backend contract (DO NOT change without updating the FastAPI service):
 *
 *   GET  /papers
 *     -> Paper[]
 *
 *   POST /upload            multipart/form-data { file, paper_name }
 *     -> { paper_id, num_pages, num_chunks, status }
 *
 *   POST /query              application/json { question, paper_id, top_k }
 *     -> { answer, sources: Source[], processing_time_ms }
 * ────────────────────────────────────────────────────────────────────────
 */

/** Fetches every indexed paper in the library. */
export function getPapers(signal) {
  return request("/papers", { signal });
}

/**
 * Uploads a PDF for indexing.
 * @param {File} file
 * @param {string} paperName
 * @param {(percent:number)=>void} onProgress optional upload-progress callback (0-100)
 */
export function uploadPaper(file, paperName, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("paper_name", paperName);

  // XHR is used here (instead of fetch) purely to get real upload progress
  // events for the progress bar — the request contract is identical to
  // POST /upload described above.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON response */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(
          new Error(
            (data && (data.detail || data.message)) ||
            `Upload failed with status ${xhr.status}`
          )
        );
      }
    };

    xhr.onerror = () => reject(new Error("Can't reach the backend. Check that the API server is running."));
    xhr.send(formData);
  });
}

/**
 * Asks a question against the indexed corpus.
 * @param {{question: string, paperId?: string, topK?: number}} params
 */
export function queryPapers({ question, paperId, topK = 5 }, signal) {
  return request("/query", {
    method: "POST",
    body: {
      question,
      paper_id: paperId ?? null,
      top_k: topK,
    },
    signal,
  });
}
