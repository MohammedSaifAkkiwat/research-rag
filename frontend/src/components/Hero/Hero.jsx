import { motion } from "framer-motion";
import { ArrowUpRight, FileUp, Layers } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { FloatingCubes } from "../FloatingCubes/FloatingCubes";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Hero({ onUploadClick }) {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* left: copy */}
        <div>
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <Badge variant="violet" className="mb-6">
              <Layers className="h-3 w-3" />
              Hybrid BM25 + Vector Retrieval
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="text-ink">Chat with research</span>
            <br />
            <span className="text-gradient-animated">papers, not PDFs.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            Upload any paper and ask it anything. Under the hood, a hybrid retrieval
            engine — lexical search, dense vectors, and cross-encoder reranking — finds
            the exact passages your question needs, then cites every one.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button size="lg" onClick={onUploadClick}>
              <FileUp className="h-[18px] w-[18px]" />
              Upload a paper
            </Button>
            <Button size="lg" variant="secondary" as="a" href="#docs">
              View documentation
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-mono text-ink-faint"
          >
            <span>REACT + VITE</span>
            <span className="h-1 w-1 rounded-full bg-ink-faint/50" />
            <span>FASTAPI</span>
            <span className="h-1 w-1 rounded-full bg-ink-faint/50" />
            <span>GEMINI</span>
            <span className="h-1 w-1 rounded-full bg-ink-faint/50" />
            <span>HYBRID RAG</span>
          </motion.div>
        </div>

        {/* right: signature floating-cube visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <FloatingCubes />
        </motion.div>
      </div>
    </section>
  );
}
