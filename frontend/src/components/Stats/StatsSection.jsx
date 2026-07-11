import { motion } from "framer-motion";
import { Library, Layers, Gauge, ListTree, Cpu, GitMerge } from "lucide-react";
import { StatCard } from "./StatCard";

export function StatsSection({ papers, lastLatencyMs, topK }) {
  const totalChunks = papers.reduce((sum, p) => sum + (p.num_chunks ?? p.chunks ?? 0), 0);

  const stats = [
    { icon: Library, label: "Papers indexed", value: papers.length },
    { icon: Layers, label: "Chunks indexed", value: totalChunks },
    {
      icon: Gauge,
      label: "Last retrieval latency",
      value: lastLatencyMs ? Math.round(lastLatencyMs) : 0,
      suffix: " ms",
    },
    { icon: ListTree, label: "Top K sources", value: topK },
  ];

  return (
    <section id="stats" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">System at a glance</h2>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            Live figures from your index and most recent query.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-4 flex flex-col gap-3 rounded-2xl border border-border glass p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Cpu className="h-4 w-4 text-cyan-300" />
            Generation model
            <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-xs text-cyan-300">
              Gemini
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <GitMerge className="h-4 w-4 text-violet-300" />
            Retrieval strategy
            <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-0.5 font-mono text-xs text-violet-300">
              Hybrid (BM25 + Vector + Rerank)
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
