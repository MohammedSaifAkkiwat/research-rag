import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export const INDEXING_STEPS = [
  "Uploading PDF",
  "Parsing document structure",
  "Generating embeddings",
  "Building BM25 index",
  "Saving vectors",
];

/**
 * Visualizes the indexing pipeline as a checklist. `currentStep` is an
 * index into INDEXING_STEPS; steps before it are complete, the current
 * one is active/spinning, later ones are pending.
 */
export function IndexingSteps({ currentStep }) {
  return (
    <ul className="space-y-2.5">
      {INDEXING_STEPS.map((label, i) => {
        const state = i < currentStep ? "done" : i === currentStep ? "active" : "pending";
        return (
          <motion.li
            key={label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: state === "pending" ? 0.4 : 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 text-sm"
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                state === "done" && "border-signal-green/40 bg-signal-green/15 text-signal-green",
                state === "active" && "border-violet-500/40 bg-violet-500/15 text-violet-400",
                state === "pending" && "border-border text-ink-faint"
              )}
            >
              <AnimatePresence mode="wait">
                {state === "done" ? (
                  <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </motion.span>
                ) : state === "active" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className="h-1 w-1 rounded-full bg-current" />
                )}
              </AnimatePresence>
            </span>
            <span className={cn(state === "pending" ? "text-ink-faint" : "text-ink")}>{label}</span>
          </motion.li>
        );
      })}
    </ul>
  );
}
