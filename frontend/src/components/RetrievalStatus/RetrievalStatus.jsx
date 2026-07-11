import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Renders the hybrid-retrieval pipeline as a horizontal sequence of pills.
 * `activeIndex` marks the in-progress stage; everything before it is
 * "complete", everything after is pending.
 */
export function RetrievalStatus({ stages, activeIndex }) {
  return (
    <div className="glass flex flex-wrap items-center gap-2 rounded-xl border border-border px-4 py-3">
      {stages.map((stage, i) => {
        const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
        return (
          <div key={stage.key} className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: state === "pending" ? 0.35 : 1 }}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono",
                state === "done" && "border-signal-green/30 bg-signal-green/10 text-signal-green",
                state === "active" && "border-violet-500/40 bg-violet-500/10 text-violet-300",
                state === "pending" && "border-border text-ink-faint"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {state === "done" ? (
                  <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </motion.span>
                ) : state === "active" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </AnimatePresence>
              {stage.label}
            </motion.div>
            {i < stages.length - 1 && <span className="h-px w-3 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}
