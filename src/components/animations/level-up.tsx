"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

interface LevelUpFlashProps {
  show: boolean;
  level: number;
  onComplete: () => void;
}

export function LevelUpFlash({ show, level, onComplete }: LevelUpFlashProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (show) {
      timerRef.current = setTimeout(() => {
        onComplete();
      }, 2000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Flash overlay */}
          <motion.div
            className="absolute inset-0 bg-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.2 }}
          />

          {/* LEVEL UP! text */}
          <motion.span
            className="font-heading text-secondary text-lg z-10"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.3, 1], opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            LEVEL UP!
          </motion.span>

          {/* Level number */}
          <motion.span
            className="font-heading text-text text-[14px] mt-2 z-10"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            LV.{level}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
