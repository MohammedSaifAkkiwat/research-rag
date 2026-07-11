import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { cn } from "../../utils/cn";

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  default: Info,
};

const ACCENTS = {
  success: "text-signal-green border-signal-green/25",
  error: "text-signal-red border-signal-red/25",
  info: "text-cyan-400 border-cyan-400/25",
  default: "text-violet-400 border-violet-500/25",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant] || ICONS.default;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              role="status"
              className="glass-strong pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-card"
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", ACCENTS[t.variant] || ACCENTS.default)} />
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-sm font-semibold text-ink">{t.title}</p>}
                {t.description && (
                  <p className="mt-0.5 text-sm text-ink-muted leading-relaxed">{t.description}</p>
                )}
                {t.action && (
                  <button
                    onClick={() => {
                      t.action.onClick();
                      dismiss(t.id);
                    }}
                    className="mt-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-md p-1 text-ink-faint hover:text-ink hover:bg-white/[0.06] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
