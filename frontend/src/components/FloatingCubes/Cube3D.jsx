import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const FACE_BASE =
  "absolute inset-0 rounded-xl border backface-hidden glass-strong flex items-center justify-center";

/**
 * A single floating, slowly-rotating glass cube. Each face can optionally
 * host an icon — used in the hero to tag faces with pipeline concepts
 * (BM25 / Vector / Rerank) rather than being purely decorative.
 */
export function Cube3D({ size = 96, icon: Icon, accent = "violet", duration = 20, delay = 0, className }) {
  const half = size / 2;
  const accentClasses =
    accent === "violet"
      ? "border-violet-500/30 shadow-glow text-violet-300"
      : "border-cyan-400/30 shadow-glow-cyan text-cyan-300";

  const faces = [
    { transform: `rotateY(0deg) translateZ(${half}px)` },
    { transform: `rotateY(90deg) translateZ(${half}px)` },
    { transform: `rotateY(180deg) translateZ(${half}px)` },
    { transform: `rotateY(-90deg) translateZ(${half}px)` },
    { transform: `rotateX(90deg) translateZ(${half}px)` },
    { transform: `rotateX(-90deg) translateZ(${half}px)` },
  ];

  return (
    <motion.div
      className={cn("perspective-1000", className)}
      style={{ width: size, height: size }}
      animate={{ y: [0, -16, 0] }}
      transition={{ duration: duration / 3.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <motion.div
        className="relative h-full w-full preserve-3d"
        animate={{ rotateY: 360, rotateX: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {faces.map((face, i) => (
          <div key={i} className={cn(FACE_BASE, accentClasses)} style={{ transform: face.transform }}>
            {Icon && i === 0 && <Icon className="h-1/3 w-1/3 opacity-80" strokeWidth={1.5} />}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
