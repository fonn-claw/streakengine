"use client";

import { motion } from "motion/react";

interface StreakFlameProps {
  active: boolean;
  atRisk: boolean;
}

export function StreakFlame({ active, atRisk }: StreakFlameProps) {
  const src = atRisk
    ? "/assets/icon-flame-danger.svg"
    : "/assets/icon-flame.svg";

  return (
    <motion.img
      src={src}
      alt="Streak flame"
      width={32}
      height={32}
      animate={
        active && !atRisk ? { scale: [1, 1.05, 1] } : { scale: 1 }
      }
      transition={
        active && !atRisk
          ? { repeat: Infinity, duration: 2 }
          : {}
      }
    />
  );
}
