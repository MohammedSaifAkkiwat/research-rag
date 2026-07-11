import { motion } from "framer-motion";
import { LibraryBig, AlertTriangle, RotateCcw } from "lucide-react";
import { PaperCard } from "../PaperCard/PaperCard";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/Button";

export function PaperLibrary({ papers, isLoading, loadError, onRetry, selectedPaperId, onSelectPaper }) {
  return (
    <section id="library" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Paper library</h2>
            <p className="mt-2 text-sm text-ink-muted sm:text-base">
              Select a paper to scope your questions, or leave none selected to search everything.
            </p>
          </div>
          {selectedPaperId && (
            <button
              onClick={() => onSelectPaper(selectedPaperId)}
              className="self-start text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors sm:self-auto"
            >
              Clear selection
            </button>
          )}
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[152px] rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && loadError && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-signal-red/25 bg-signal-red/[0.05] px-6 py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-signal-red" />
            <p className="text-sm text-ink">Couldn't load your paper library.</p>
            <p className="max-w-md text-xs text-ink-faint">{loadError}</p>
            <Button variant="secondary" size="sm" onClick={onRetry}>
              <RotateCcw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !loadError && papers.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <LibraryBig className="h-8 w-8 text-ink-faint" />
            <p className="text-sm text-ink">No papers indexed yet.</p>
            <p className="max-w-sm text-xs text-ink-faint">
              Upload a PDF above to build your first hybrid search index.
            </p>
          </div>
        )}

        {!isLoading && !loadError && papers.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper, i) => (
              <PaperCard
                key={paper.paper_id || paper.id || i}
                paper={paper}
                index={i}
                selected={selectedPaperId === (paper.paper_id || paper.id)}
                onSelect={onSelectPaper}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
