import { motion } from "framer-motion";
import { UploadZone } from "./UploadZone";

export function UploadSection({ onUpload }) {
  return (
    <section id="upload" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Add a paper to the library</h2>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            PDFs are chunked, embedded, and indexed for both lexical and semantic search.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <UploadZone onUpload={onUpload} />
        </motion.div>
      </div>
    </section>
  );
}
