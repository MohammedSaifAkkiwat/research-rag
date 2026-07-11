import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText, Target } from "lucide-react";
import { formatScore, truncate } from "../../utils/format";
import { cn } from "../../utils/cn";

export function CitationCard({ source, index }) {
  const [expanded, setExpanded] = useState(false);

  const content = source.content || source.text || source.chunk_text || source.chunk || "";
  const page = source.page ?? source.page_number ?? source.metadata?.page;
  const score = source.score ?? source.relevance_score ?? source.similarity ?? source.rerank_score;
  const paperName = source.paper_name || source.source || source.metadata?.paper_name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="overflow-hidden rounded-xl border border-border bg-white/[0.02] transition-colors hover:border-border-hover"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15 font-mono text-[10px] font-semibold text-violet-300">
              {index + 1}
            </span>
            {paperName && (
              <span className="flex items-center gap-1 truncate text-xs font-medium text-ink-muted">
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate">{paperName}</span>
              </span>
            )}
            {page !== undefined && page !== null && (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-ink-faint">
                p.{page}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">
            {expanded ? content : truncate(content, 160)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {score !== undefined && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-cyan-300">
              <Target className="h-3 w-3" />
              {formatScore(score)}
            </span>
          )}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-ink-faint" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && score !== undefined && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 pb-4"
          >
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400")}
                style={{ width: `${Math.min(100, Math.max(0, score > 1 ? score : score * 100))}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
