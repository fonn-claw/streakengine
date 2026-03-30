"use client";

import { motion, AnimatePresence } from "motion/react";
import { useRef } from "react";

interface XPFloatProps {
  amount: number | null;
  onComplete: () => void;
}

export function XPFloat({ amount, onComplete }: XPFloatProps) {
  const keyRef = useRef(0);

  if (amount !== null) {
    keyRef.current += 1;
  }

  return (
    <AnimatePresence>
      {amount !== null && (
        <motion.span
          key={keyRef.current}
          className="absolute font-heading text-secondary text-xs pointer-events-none"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={onComplete}
        >
          +{amount} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}
