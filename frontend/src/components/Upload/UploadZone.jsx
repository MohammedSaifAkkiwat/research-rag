import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, CheckCircle2 } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Progress } from "../ui/Progress";
import { IndexingSteps, INDEXING_STEPS } from "./IndexingSteps";
import { formatBytes } from "../../utils/format";
import { cn } from "../../utils/cn";

const MAX_SIZE_MB = 50;

export function UploadZone({ onUpload }) {
  const [file, setFile] = useState(null);
  const [paperName, setPaperName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | uploading | processing | done | error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const processTimer = useRef(null);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected?.length) {
      setStatus("error");
      return;
    }
    const picked = accepted[0];
    if (!picked) return;
    setFile(picked);
    setPaperName(picked.name.replace(/\.pdf$/i, ""));
    setStatus("idle");
    setResult(null);
    setUploadProgress(0);
    setStepIndex(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    multiple: false,
    disabled: status === "uploading" || status === "processing",
  });

  const reset = () => {
    clearInterval(processTimer.current);
    setFile(null);
    setPaperName("");
    setStatus("idle");
    setUploadProgress(0);
    setStepIndex(0);
    setResult(null);
  };

  const startUpload = async () => {
    if (!file || !paperName.trim()) return;
    setStatus("uploading");
    setStepIndex(0);

    try {
      const uploadPromise = onUpload(file, paperName.trim(), (percent) => {
        setUploadProgress(percent);
        if (percent >= 100) setStatus("processing");
      });

      // Once bytes are on the wire, cycle through the remaining indexing
      // steps (parsing, embeddings, BM25, vectors) while we wait for the
      // backend to finish and respond — the backend performs this work
      // synchronously within POST /upload, so this timer just visualizes
      // the wait rather than driving real progress.
      processTimer.current = setInterval(() => {
        setStepIndex((prev) => (prev < INDEXING_STEPS.length - 1 ? prev + 1 : prev));
      }, 700);

      const data = await uploadPromise;
      clearInterval(processTimer.current);
      setStepIndex(INDEXING_STEPS.length);
      setResult(data);
      setStatus("done");
    } catch {
      clearInterval(processTimer.current);
      setStatus("error");
    }
  };

  const isBusy = status === "uploading" || status === "processing";

  return (
    <Card className="p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {!file && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors duration-200",
                isDragActive && !isDragReject && "border-violet-400/60 bg-violet-500/[0.06]",
                isDragReject && "border-signal-red/60 bg-signal-red/[0.06]",
                !isDragActive && "border-border hover:border-violet-400/40 hover:bg-white/[0.02]"
              )}
            >
              <input {...getInputProps()} aria-label="Upload a PDF research paper" />
              <motion.div
                animate={{ y: isDragActive ? -6 : 0 }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-violet-300 shadow-glow"
              >
                <UploadCloud className="h-7 w-7" strokeWidth={1.75} />
              </motion.div>
              <p className="text-base font-medium text-ink">
                {isDragReject ? "Only PDF files are supported" : "Drag a PDF here"}
              </p>
              <p className="mt-1 text-sm text-ink-muted">or click to browse — up to {MAX_SIZE_MB}MB</p>
            </div>
          </motion.div>
        )}

        {file && (
          <motion.div
            key="staged"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                  <p className="text-xs text-ink-faint">{formatBytes(file.size)}</p>
                </div>
              </div>
              {!isBusy && status !== "done" && (
                <button
                  onClick={reset}
                  aria-label="Remove selected file"
                  className="shrink-0 rounded-lg p-1.5 text-ink-faint hover:text-ink hover:bg-white/[0.06] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {status === "idle" && (
              <div className="space-y-3">
                <label htmlFor="paper-name" className="block text-xs font-medium text-ink-muted">
                  Paper name
                </label>
                <input
                  id="paper-name"
                  value={paperName}
                  onChange={(e) => setPaperName(e.target.value)}
                  placeholder="e.g. Attention Is All You Need"
                  className="w-full rounded-lg border border-border bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-violet-400/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-violet-500"
                />
                <Button onClick={startUpload} disabled={!paperName.trim()} className="w-full">
                  Index this paper
                </Button>
              </div>
            )}

            {isBusy && (
              <div className="space-y-5">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs text-ink-muted">
                    <span>{status === "uploading" ? "Uploading" : "Indexing document…"}</span>
                    <span className="font-mono">{status === "uploading" ? `${uploadProgress}%` : ""}</span>
                  </div>
                  <Progress value={status === "uploading" ? uploadProgress : 100} />
                </div>
                <IndexingSteps currentStep={stepIndex} />
              </div>
            )}

            {status === "done" && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 rounded-lg border border-signal-green/25 bg-signal-green/10 px-3.5 py-2.5 text-sm text-signal-green">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Indexed successfully — ready to query.
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg border border-border bg-white/[0.02] py-3">
                    <p className="font-mono text-lg font-semibold text-ink">{result.num_pages ?? "—"}</p>
                    <p className="text-xs text-ink-faint">pages</p>
                  </div>
                  <div className="rounded-lg border border-border bg-white/[0.02] py-3">
                    <p className="font-mono text-lg font-semibold text-ink">{result.num_chunks ?? "—"}</p>
                    <p className="text-xs text-ink-faint">chunks</p>
                  </div>
                  <div className="rounded-lg border border-border bg-white/[0.02] py-3">
                    <p className="font-mono text-lg font-semibold capitalize text-signal-green">
                      {result.status ?? "ready"}
                    </p>
                    <p className="text-xs text-ink-faint">status</p>
                  </div>
                </div>
                <Button variant="secondary" className="w-full" onClick={reset}>
                  Upload another paper
                </Button>
              </motion.div>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <div className="rounded-lg border border-signal-red/25 bg-signal-red/10 px-3.5 py-2.5 text-sm text-signal-red">
                  Something went wrong while indexing this paper.
                </div>
                <Button variant="destructive" className="w-full" onClick={startUpload}>
                  Retry upload
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
