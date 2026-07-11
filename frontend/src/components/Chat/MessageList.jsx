import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { RetrievalStatus } from "../RetrievalStatus/RetrievalStatus";

const SUGGESTIONS = [
  "Summarize the key contributions of this paper",
  "What methodology did the authors use?",
  "What are the limitations mentioned?",
];

export function MessageList({ messages, isThinking, stages, activeStageIndex, onRetry, onSuggestion }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-violet-300 shadow-glow">
          <Sparkles className="h-6 w-6" />
        </span>
        <div>
          <p className="text-base font-medium text-ink">Ask anything about your papers</p>
          <p className="mt-1 text-sm text-ink-muted">Answers are grounded in retrieved passages with citations.</p>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion(s)}
              className="rounded-full border border-border px-3.5 py-1.5 text-xs text-ink-muted transition-colors hover:border-violet-400/40 hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onRetry={onRetry} />
      ))}

      {isThinking && (
        <div className="flex w-full justify-start gap-3">
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <div className="max-w-[85%] space-y-2.5 sm:max-w-[75%]">
            <RetrievalStatus stages={stages} activeIndex={activeStageIndex} />
            <div className="glass w-fit rounded-2xl rounded-tl-sm px-2">
              <TypingIndicator />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
