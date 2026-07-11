import { cn } from "../../utils/cn";

const VARIANTS = {
  default: "bg-white/[0.06] text-ink-muted border-border",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/25",
  cyan: "bg-cyan-400/10 text-cyan-300 border-cyan-400/25",
  success: "bg-signal-green/10 text-signal-green border-signal-green/25",
  warning: "bg-signal-amber/10 text-signal-amber border-signal-amber/25",
  danger: "bg-signal-red/10 text-signal-red border-signal-red/25",
};

export function Badge({ className, variant = "default", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium font-mono tracking-wide",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
