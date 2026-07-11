import { motion } from "framer-motion";
import { BookOpen, FileText } from "lucide-react";
import { GithubIcon } from "../ui/icons";

const NAV_LINKS = [
  { label: "Library", href: "#library" },
  { label: "Chat", href: "#chat" },
  { label: "Stats", href: "#stats" },
];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="glass-strong flex h-12 flex-1 items-center justify-between rounded-2xl px-4 shadow-card sm:px-5">
          <a href="#top" className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-violet-500 rounded-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 shadow-glow">
              <BookOpen className="h-4 w-4 text-white" strokeWidth={2.25} />
            </span>
            <span className="font-display text-base font-semibold tracking-tight text-ink">
              Research<span className="text-gradient">AI</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-violet-500"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <a
              href="https://github.com/MohammedSaifAkkiwat/research-rag"
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
              className="rounded-lg p-2 text-ink-muted transition-colors hover:text-ink hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-violet-500"
            >
              <GithubIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href="#docs"
              aria-label="Documentation"
              className="hidden rounded-lg p-2 text-ink-muted transition-colors hover:text-ink hover:bg-white/[0.05] sm:block focus-visible:outline-2 focus-visible:outline-violet-500"
            >
              <FileText className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
