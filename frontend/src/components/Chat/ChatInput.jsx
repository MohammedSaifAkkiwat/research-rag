import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";
import { cn } from "../../utils/cn";

export function ChatInput({ onSend, disabled, value, onChangeValue }) {
  const [localValue, setLocalValue] = useState("");
  const textareaRef = useRef(null);
  const isControlled = value !== undefined;
  const text = isControlled ? value : localValue;

  const setText = (v) => {
    if (isControlled) onChangeValue?.(v);
    else setLocalValue(v);
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const autoResize = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-border p-3 sm:p-4">
      <div className="glass flex items-end gap-2 rounded-2xl border border-border px-3 py-2.5 focus-within:border-violet-400/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoResize(e);
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask a question about your papers…"
          aria-label="Ask a question"
          className="max-h-40 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={submit}
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
            text.trim() && !disabled
              ? "bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow-glow"
              : "bg-white/[0.05] text-ink-faint"
          )}
        >
          <SendHorizontal className="h-4 w-4" />
        </motion.button>
      </div>
      <p className="mt-2 px-1 text-[11px] text-ink-faint">
        <kbd className="rounded border border-border px-1 py-0.5 font-mono">Enter</kbd> to send ·{" "}
        <kbd className="rounded border border-border px-1 py-0.5 font-mono">Shift + Enter</kbd> for a new line
      </p>
    </div>
  );
}
