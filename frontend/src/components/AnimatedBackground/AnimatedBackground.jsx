import { motion } from "framer-motion";
import { useMouseParallax } from "../../hooks/useMouseParallax";

/**
 * Fixed, full-viewport ambient backdrop: faint grid, two slow-drifting
 * aurora blobs (violet + cyan — echoing the hybrid BM25/vector duality),
 * and a film-grain noise layer. Reacts very slightly to pointer position.
 * Purely decorative — aria-hidden, pointer-events disabled.
 */
export function AnimatedBackground() {
  const { x, y } = useMouseParallax();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void noise">
      {/* base grid */}
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]" />

      {/* aurora blob — violet, top-left */}
      <motion.div
        className="absolute -left-1/4 -top-1/4 h-[70vh] w-[70vh] rounded-full bg-aurora-violet blur-3xl"
        animate={{ x: x * 20, y: y * 20 }}
        transition={{ type: "spring", stiffness: 40, damping: 20 }}
      />

      {/* aurora blob — cyan, bottom-right */}
      <motion.div
        className="absolute -right-1/4 top-1/3 h-[60vh] w-[60vh] rounded-full bg-aurora-cyan blur-3xl"
        animate={{ x: x * -25, y: y * -15 }}
        transition={{ type: "spring", stiffness: 40, damping: 20 }}
      />

      {/* vignette to keep edges dark */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,transparent_0%,#08080D_100%)]" />
    </div>
  );
}
