import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

/**
 * Renders assistant answers as GitHub-flavored markdown: tables, lists,
 * fenced code blocks (syntax highlighted), bold/italic, and links.
 */
export function MarkdownContent({ content }) {
  return (
    <div
      className="prose prose-invert prose-sm sm:prose-base max-w-none
        prose-p:leading-relaxed prose-p:text-ink prose-p:my-2
        prose-headings:font-display prose-headings:text-ink
        prose-strong:text-ink prose-strong:font-semibold
        prose-a:text-violet-400 prose-a:no-underline hover:prose-a:text-violet-300
        prose-code:before:content-none prose-code:after:content-none
        prose-code:rounded prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-cyan-300 prose-code:font-mono prose-code:text-[0.85em]
        prose-pre:bg-void-raised prose-pre:border prose-pre:border-border prose-pre:rounded-xl
        prose-table:text-sm prose-th:text-ink prose-td:border-border prose-th:border-border
        prose-blockquote:border-violet-500/40 prose-blockquote:text-ink-muted
        prose-li:text-ink prose-ul:my-2 prose-ol:my-2"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
