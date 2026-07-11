import { useCallback, useEffect, useState } from "react";
import { getPapers, uploadPaper } from "../services/api";
import { useToast } from "./useToast";

/**
 * Owns the paper-library state: the list of indexed papers, which one
 * (if any) is selected as a chat filter, and the upload lifecycle.
 */
export function usePapers() {
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const toast = useToast();

  const fetchPapers = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getPapers();
      setPapers(Array.isArray(data) ? data : data?.papers ?? []);
    } catch (err) {
      setLoadError(err.message || "Failed to load papers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleUpload = useCallback(
    async (file, paperName, onProgress) => {
      try {
        const result = await uploadPaper(file, paperName, onProgress);
        toast.success("Paper indexed", `${paperName} is ready to query.`);
        await fetchPapers();
        // Auto-select the paper we just uploaded so the chat is immediately
        // scoped to it — no extra click needed, and it fixes the case where
        // a fresh library had nothing to select from before this upload.
        if (result?.paper_id) {
          setSelectedPaperId(result.paper_id);
        }
        return result;
      } catch (err) {
        toast.error("Upload failed", err.message || "Something went wrong while indexing your PDF.", {
          duration: 8000,
        });
        throw err;
      }
    },
    [fetchPapers, toast]
  );

  const toggleSelectedPaper = useCallback((paperId) => {
    setSelectedPaperId((prev) => (prev === paperId ? null : paperId));
  }, []);

  return {
    papers,
    isLoading,
    loadError,
    refetch: fetchPapers,
    selectedPaperId,
    toggleSelectedPaper,
    uploadPaper: handleUpload,
  };
}
