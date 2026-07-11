import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export function Progress({ value = 0, className, barClassName }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}
    >
      <motion.div
        className={cn("h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400", barClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}
