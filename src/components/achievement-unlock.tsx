"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useMemo } from "react";

interface AchievementUnlockProps {
  achievementIds: number[];
  achievementMap?: Record<number, { name: string; icon: string }>;
  onComplete: () => void;
}

function generateSparkles() {
  const colors = ["bg-secondary", "bg-primary", "bg-accent", "bg-success"];
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 60 + Math.random() * 40;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      color: colors[i % colors.length],
    };
  });
}

export function AchievementUnlock({
  achievementIds,
  achievementMap,
  onComplete,
}: AchievementUnlockProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sparkles = useMemo(() => generateSparkles(), []);

  const currentId = achievementIds[0];
  const info = currentId && achievementMap ? achievementMap[currentId] : null;

  useEffect(() => {
    if (achievementIds.length > 0) {
      timerRef.current = setTimeout(() => {
        onComplete();
      }, 1200);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [achievementIds, onComplete]);

  if (achievementIds.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onComplete}
      >
        {/* Glow border wrapper */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 30px 10px var(--color-secondary)",
              "0 0 0px 0px var(--color-secondary)",
            ],
          }}
          transition={{ duration: 1 }}
        >
          {/* Badge with scale animation */}
          <motion.div
            className="w-24 h-24 flex items-center justify-center pixel-border bg-surface p-3"
            animate={{ scale: [0, 1.1, 1.0] }}
            transition={{ duration: 0.4, times: [0, 0.7, 1] }}
          >
            {info ? (
              <img
                src={`/assets/${info.icon}`}
                alt={info.name}
                width={48}
                height={48}
              />
            ) : (
              <img
                src="/assets/icon-xp-star.svg"
                alt="Achievement"
                width={48}
                height={48}
              />
            )}
          </motion.div>

          {/* Sparkle particles */}
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className={`absolute w-2 h-2 ${sparkle.color}`}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: sparkle.x,
                y: sparkle.y,
                opacity: 0,
              }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          ))}
        </motion.div>

        {/* Text */}
        <motion.p
          className="font-heading text-secondary text-[12px] mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          ACHIEVEMENT UNLOCKED!
        </motion.p>

        {info && (
          <motion.p
            className="font-body text-text text-[11px] mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {info.name}
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
