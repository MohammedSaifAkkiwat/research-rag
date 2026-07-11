import { useCallback, useRef, useState } from "react";
import { queryPapers } from "../services/api";
import { useToast } from "./useToast";

/**
 * Retrieval pipeline stages shown while a query is in flight.
 * The backend responds in one shot (POST /query), so we advance through
 * these stages on a timer to visualize the hybrid-RAG pipeline; the final
 * stage holds until the real response actually arrives.
 */
export const RETRIEVAL_STAGES = [
  { key: "bm25", label: "Searching BM25 index" },
  { key: "vector", label: "Searching vector database" },
  { key: "hybrid", label: "Fusing hybrid retrieval scores" },
  { key: "rerank", label: "Cross-encoder reranking" },
  { key: "generate", label: "Generating response" },
];

let msgId = 0;
const nextId = () => `msg_${++msgId}_${Date.now()}`;

export function useChat({ selectedPaperId, topK = 5 } = {}) {
  const [messages, setMessages] = useState([]);
  const [activeStageIndex, setActiveStageIndex] = useState(-1);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef(null);
  // React state updates aren't synchronous, so a fast double Enter/click can
  // fire sendMessage twice before `isThinking` has actually re-rendered.
  // This ref is set synchronously and is the real re-entrancy guard.
  const isSendingRef = useRef(false);
  const toast = useToast();

  const sendMessage = useCallback(
    async (question) => {
      const trimmed = question.trim();
      if (!trimmed || isSendingRef.current) return;
      isSendingRef.current = true;

      const userMessage = { id: nextId(), role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);
      setActiveStageIndex(0);

      // Advance the visual pipeline stages while we wait for the backend.
      // Stops one stage before the end so "Generating response" holds
      // until data actually returns, instead of lying about completion.
      const stageTimer = setInterval(() => {
        setActiveStageIndex((prev) => {
          if (prev >= RETRIEVAL_STAGES.length - 1) {
            clearInterval(stageTimer);
            return prev;
          }
          return prev + 1;
        });
      }, 550);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await queryPapers(
          { question: trimmed, paperId: selectedPaperId, topK },
          controller.signal
        );

        const assistantMessage = {
          id: nextId(),
          role: "assistant",
          content: response.answer ?? "No answer was returned.",
          sources: response.sources ?? [],
          processingTimeMs: response.processing_time_ms,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        if (err.name === "AbortError") return;
        toast.error("Query failed", err.message || "The assistant couldn't process that question.", {
          duration: 8000,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content: "",
            error: err.message || "Something went wrong while retrieving an answer.",
            retryQuestion: trimmed,
          },
        ]);
      } finally {
        clearInterval(stageTimer);
        isSendingRef.current = false;
        setIsThinking(false);
        setActiveStageIndex(-1);
      }
    },
    [selectedPaperId, topK, toast]
  );

  const retryLastQuestion = useCallback(
    (question) => {
      setMessages((prev) => prev.filter((m) => !m.error));
      sendMessage(question);
    },
    [sendMessage]
  );

  const clearChat = useCallback(() => setMessages([]), []);

  return {
    messages,
    sendMessage,
    retryLastQuestion,
    clearChat,
    isThinking,
    activeStageIndex,
    stages: RETRIEVAL_STAGES,
  };
}
