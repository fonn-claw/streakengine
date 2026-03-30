"use client";

import { useState, useCallback } from "react";
import { PixelCard } from "@/components/ui/pixel-card";
import { DoneStamp } from "@/components/animations/done-stamp";
import { XPFloat } from "@/components/animations/xp-float";
import { completeHabit, incrementProgress } from "@/lib/actions/habits";
import clsx from "clsx";
import type { Quest } from "@/lib/queries/habits";

interface CompleteResult {
  xpEarned: number;
  leveledUp: boolean;
  newLevel: number;
  newTotalXp: number;
  streakIncremented: boolean;
  newStreak: number;
  newlyUnlocked: number[];
}

interface QuestCardProps {
  quest: Quest;
  multiplier: number;
  onComplete: (result: CompleteResult & { progress?: number; completed?: boolean }) => void;
}

export function QuestCard({ quest, multiplier, onComplete }: QuestCardProps) {
  const [completed, setCompleted] = useState(quest.completed);
  const [progress, setProgress] = useState(quest.progress);
  const [pending, setPending] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [xpFloat, setXpFloat] = useState<number | null>(null);

  const triggerCompletionEffects = useCallback(
    (xpEarned: number) => {
      // DONE stamp at ~100ms
      setTimeout(() => setShowStamp(true), 100);
      // XP float
      setTimeout(() => setXpFloat(xpEarned), 200);
      // Clear stamp after XP float duration
      setTimeout(() => setShowStamp(false), 800);
    },
    [],
  );

  const handleComplete = useCallback(async () => {
    if (completed || pending) return;

    // Optimistic: immediately show completed state (0ms feedback)
    setCompleted(true);
    setPending(true);

    triggerCompletionEffects(Math.round(quest.xpReward * multiplier));

    try {
      const result = await completeHabit(quest.id);
      if (result.xpEarned > 0) {
        setXpFloat(result.xpEarned);
      }
      onComplete(result);
    } catch {
      // Revert on error
      setCompleted(false);
    } finally {
      setPending(false);
    }
  }, [completed, pending, quest.id, quest.xpReward, multiplier, onComplete, triggerCompletionEffects]);

  const handleIncrement = useCallback(async () => {
    if (completed || pending) return;

    setPending(true);

    try {
      const result = await incrementProgress(quest.id);
      setProgress(result.progress);

      if (result.completed) {
        setCompleted(true);
        triggerCompletionEffects(result.xpEarned);
      }

      onComplete(result);
    } catch {
      // Silently fail — state remains as-is
    } finally {
      setPending(false);
    }
  }, [completed, pending, quest.id, onComplete, triggerCompletionEffects]);

  const isSingleCompletion = quest.targetCount === 1;
  const iconSrc = quest.icon ? `/assets/${quest.icon}.svg` : "/assets/icon-xp-star.svg";

  return (
    <div className="relative">
      <PixelCard
        className={clsx(
          "w-full flex items-center gap-3",
          completed && "opacity-70",
        )}
      >
        {/* Left side: checkbox or progress blocks */}
        {isSingleCompletion ? (
          <button
            type="button"
            onClick={handleComplete}
            disabled={completed || pending}
            className={clsx(
              "w-6 h-6 flex-shrink-0 border-3 border-border flex items-center justify-center",
              completed ? "bg-success" : "bg-surface",
              !completed && !pending && "cursor-pointer hover:bg-surface-raised",
            )}
            aria-label={`Complete ${quest.name}`}
          >
            {completed && (
              <img
                src="/assets/icon-check.svg"
                alt="Done"
                width={16}
                height={16}
              />
            )}
          </button>
        ) : (
          <div className="flex flex-col gap-1 flex-shrink-0">
            <div className="flex gap-[2px]">
              {Array.from({ length: quest.targetCount }, (_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "w-2 h-2 border border-border",
                    i < progress ? "bg-success" : "bg-surface-raised",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={completed || pending}
              className={clsx(
                "font-body text-[10px] text-accent pixel-border px-1 py-0.5",
                !completed && !pending && "cursor-pointer hover:bg-surface-raised",
                (completed || pending) && "opacity-50",
              )}
            >
              +1
            </button>
          </div>
        )}

        {/* Center: icon + name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={iconSrc}
            alt={quest.name}
            width={16}
            height={16}
            className="flex-shrink-0"
          />
          <span className="font-body font-bold text-[12px] truncate">
            {quest.name}
          </span>
          {!isSingleCompletion && (
            <span className="font-body text-text-dim text-[10px]">
              {progress}/{quest.targetCount}
            </span>
          )}
        </div>

        {/* Right side: XP reward */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="font-heading text-secondary text-[12px]">
            +{quest.xpReward}
          </span>
          <img
            src="/assets/icon-xp-star.svg"
            alt="XP"
            width={16}
            height={16}
          />
        </div>
      </PixelCard>

      {/* Animations */}
      <DoneStamp show={showStamp} />
      <XPFloat amount={xpFloat} onComplete={() => setXpFloat(null)} />
    </div>
  );
}
