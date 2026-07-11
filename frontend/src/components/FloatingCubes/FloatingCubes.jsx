import { motion } from "framer-motion";
import { Database, SearchCode, Sparkles, FileStack } from "lucide-react";
import { Cube3D } from "./Cube3D";

/**
 * The hero's signature visual: a small constellation of glass cubes, each
 * standing in for one stage of the hybrid-retrieval pipeline (chunking,
 * lexical search, vector search, synthesis). Purely ambient/decorative.
 */
export function FloatingCubes() {
  return (
    <div aria-hidden="true" className="relative hidden h-[440px] w-full lg:block">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute right-6 top-4"
      >
        <Cube3D size={112} icon={FileStack} accent="violet" duration={24} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute left-4 top-32"
      >
        <Cube3D size={76} icon={SearchCode} accent="cyan" duration={19} delay={0.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="absolute bottom-24 right-24"
      >
        <Cube3D size={64} icon={Database} accent="cyan" duration={16} delay={1} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="absolute bottom-6 left-16"
      >
        <Cube3D size={90} icon={Sparkles} accent="violet" duration={21} delay={1.5} />
      </motion.div>

      {/* connecting glow line hinting at a pipeline */}
      <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 440" fill="none">
        <motion.path
          d="M 340 60 Q 220 140 90 170 Q 40 220 300 320 Q 350 360 160 400"
          stroke="url(#cubeGradient)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 1, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="cubeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
