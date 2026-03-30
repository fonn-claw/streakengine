"use client";

import { motion, AnimatePresence } from "motion/react";

interface DoneStampProps {
  show: boolean;
}

export function DoneStamp({ show }: DoneStampProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ scale: 2, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 5, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
        >
          <span className="font-heading text-success text-lg border-3 border-success px-3 py-1 bg-surface/80">
            DONE
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
