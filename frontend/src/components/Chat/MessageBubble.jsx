import { motion } from "framer-motion";
import { Bot, User, AlertCircle, RotateCcw, Clock } from "lucide-react";
import { MarkdownContent } from "./MarkdownContent";
import { CitationPanel } from "../Citation/CitationPanel";
import { Button } from "../ui/Button";
import { formatLatency } from "../../utils/format";
import { cn } from "../../utils/cn";

export function MessageBubble({ message, onRetry }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 shadow-glow">
          <Bot className="h-4 w-4 text-white" />
        </span>
      )}

      <div className={cn("min-w-0 max-w-[85%] sm:max-w-[75%]", isUser && "order-first")}>
        {message.error ? (
          <div className="rounded-2xl rounded-tl-sm border border-signal-red/25 bg-signal-red/[0.06] px-4 py-3.5">
            <div className="flex items-start gap-2 text-sm text-signal-red">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{message.error}</p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="mt-3"
              onClick={() => onRetry?.(message.retryQuestion)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-2xl px-4 py-3.5 shadow-inner-hairline",
              isUser
                ? "rounded-tr-sm bg-gradient-to-br from-violet-500 to-violet-600 text-white"
                : "glass rounded-tl-sm"
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            ) : (
              <MarkdownContent content={message.content} />
            )}
          </div>
        )}

        {!isUser && !message.error && (
          <>
            <CitationPanel sources={message.sources} />
            {message.processingTimeMs !== undefined && (
              <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-faint">
                <Clock className="h-3 w-3" />
                Answered in {formatLatency(message.processingTimeMs)}
              </p>
            )}
          </>
        )}
      </div>

      {isUser && (
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-ink-muted">
          <User className="h-4 w-4" />
        </span>
      )}
    </motion.div>
  );
}
