import { BookOpen, FileText, Layers } from "lucide-react";
import { GithubIcon } from "../ui/icons";

const COLUMNS = [
  {
    title: "Project",
    links: [
      { label: "GitHub", href: "https://github.com/MohammedSaifAkkiwat/research-rag", icon: GithubIcon },
      { label: "Documentation", href: "#docs", icon: FileText },
    ],
  },
  {
    title: "Stack",
    links: [
      { label: "React + Vite", href: "#", icon: Layers },
      { label: "FastAPI backend", href: "#", icon: Layers },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <a href="#top" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
                <BookOpen className="h-4 w-4 text-white" />
              </span>
              <span className="font-display text-base font-semibold text-ink">
                Research<span className="text-gradient">AI</span>
              </span>
            </a>
            <p className="mt-3 text-sm leading-relaxed text-ink-faint">
              A hybrid retrieval-augmented chat interface for research papers — built to show
              production-grade frontend engineering.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:flex sm:gap-16">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
                      >
                        <link.icon className="h-3.5 w-3.5" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 text-xs text-ink-faint sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} ResearchAI. All rights reserved.</p>
          <p>Made with React, FastAPI &amp; Gemini.</p>
        </div>
      </div>
    </footer>
  );
}
