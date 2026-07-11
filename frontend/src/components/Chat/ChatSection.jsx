import { motion } from "framer-motion";
import { MessageSquareText, FileText, X, SlidersHorizontal } from "lucide-react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export function ChatSection({
  papers,
  selectedPaperId,
  onClearPaperFilter,
  topK,
  onChangeTopK,
  messages,
  isThinking,
  stages,
  activeStageIndex,
  onSend,
  onRetry,
}) {
  const selectedPaper = papers.find((p) => (p.paper_id || p.id) === selectedPaperId);
  const selectedName = selectedPaper?.paper_name || selectedPaper?.name || selectedPaper?.title;

  return (
    <section id="chat" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Ask your papers</h2>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            Grounded answers with full source attribution, powered by hybrid retrieval.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass flex h-[640px] flex-col overflow-hidden rounded-2xl border border-border shadow-card"
        >
          {/* header */}
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 text-sm text-ink-muted">
              <MessageSquareText className="h-4 w-4 text-violet-400" />
              {selectedPaperId ? (
                <span className="flex min-w-0 items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[180px] sm:max-w-xs">{selectedName || "Selected paper"}</span>
                  <button
                    onClick={onClearPaperFilter}
                    aria-label="Clear paper filter"
                    className="ml-1 rounded-full p-0.5 hover:bg-white/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : (
                <span>Searching across all papers</span>
              )}
            </div>

            <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-faint">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Top K</span>
              <select
                value={topK}
                onChange={(e) => onChangeTopK(Number(e.target.value))}
                aria-label="Number of sources to retrieve"
                className="rounded-md border border-border bg-white/[0.03] px-1.5 py-1 font-mono text-xs text-ink focus:border-violet-400/50 focus:outline-none"
              >
                {[3, 5, 8, 10].map((n) => (
                  <option key={n} value={n} className="bg-void-raised">
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <MessageList
            messages={messages}
            isThinking={isThinking}
            stages={stages}
            activeStageIndex={activeStageIndex}
            onRetry={onRetry}
            onSuggestion={onSend}
          />

          <ChatInput onSend={onSend} disabled={isThinking} />
        </motion.div>
      </div>
    </section>
  );
}
