import { motion } from "framer-motion";
import { FileText, Layers, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "../ui/Badge";
import { formatDate } from "../../utils/format";
import { cn } from "../../utils/cn";

/**
 * A paper record from GET /papers. Field names are defensive-mapped since
 * the exact backend schema for optional metadata may vary slightly.
 */
export function PaperCard({ paper, selected, onSelect, index = 0 }) {
  const name = paper.filename || paper.paper_name || paper.name || paper.title || "Untitled paper";
  const pages = paper.num_pages ?? paper.pages ?? null;
  const chunks = paper.num_chunks ?? paper.chunks ?? null;
  const status = paper.status || "indexed";
  const uploadedAt = paper.upload_time || paper.uploaded_at || paper.created_at || paper.date;

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(paper.paper_id || paper.id)}
      aria-pressed={selected}
      className={cn(
        "group relative w-full rounded-2xl border p-5 text-left transition-all duration-200 glass",
        selected
          ? "border-violet-400/60 shadow-glow bg-violet-500/[0.06]"
          : "border-border hover:border-border-hover hover:bg-white/[0.03]"
      )}
    >
      {selected && (
        <motion.span
          layoutId="paper-selected-glow"
          className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-violet-400/50"
        />
      )}

      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            selected ? "bg-violet-500/20 text-violet-300" : "bg-white/[0.05] text-ink-muted group-hover:text-violet-300"
          )}
        >
          <FileText className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink" title={name}>
            {name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint">
            <Calendar className="h-3 w-3" />
            {formatDate(uploadedAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {pages !== null && (
          <Badge variant="default">
            <FileText className="h-3 w-3" />
            {pages} pages
          </Badge>
        )}
        {chunks !== null && (
          <Badge variant="default">
            <Layers className="h-3 w-3" />
            {chunks} chunks
          </Badge>
        )}
        <Badge variant={status === "indexed" || status === "ready" || status === "complete" ? "success" : "warning"}>
          {status === "indexed" || status === "ready" || status === "complete" ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          {status}
        </Badge>
      </div>
    </motion.button>
  );
}
