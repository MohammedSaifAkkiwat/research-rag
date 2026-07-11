import { motion } from "framer-motion";
import { useCountUp } from "../../hooks/useCountUp";
import { useInView } from "../../hooks/useInView";
import { cn } from "../../utils/cn";

export function StatCard({ icon: Icon, label, value, suffix = "", decimals = 0, isNumeric = true, index = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const animated = useCountUp(isNumeric ? value : 0, { active: inView, decimals, duration: 1400 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border glass p-5 transition-colors hover:border-border-hover"
      )}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <p className="font-mono text-2xl font-semibold text-ink sm:text-3xl">
        {isNumeric ? animated.toLocaleString() : value}
        <span className="ml-0.5 text-lg text-ink-muted">{suffix}</span>
      </p>
      <p className="mt-1 text-xs text-ink-faint">{label}</p>

      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
    </motion.div>
  );
}
