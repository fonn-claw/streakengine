"use client";

import { useState, useCallback } from "react";
import { StreakBanner } from "@/components/streak-banner";
import { QuestCard } from "@/components/quest-card";
import { LevelUpFlash } from "@/components/animations/level-up";
import { AchievementUnlock } from "@/components/achievement-unlock";
import type { Quest } from "@/lib/queries/habits";
import type { StreakState } from "@/lib/queries/streaks";

interface QuestBoardProps {
  quests: Quest[];
  multiplier: number;
  streakState: StreakState;
  level: number;
  totalXp: number;
  achievementMap?: Record<number, { name: string; icon: string }>;
}

export function QuestBoard({
  quests,
  multiplier,
  streakState,
  level,
  totalXp,
  achievementMap,
}: QuestBoardProps) {
  const [localQuests, setLocalQuests] = useState<Quest[]>(quests);
  const [currentLevel, setCurrentLevel] = useState(level);
  const [currentXp, setCurrentXp] = useState(totalXp);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(level);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);

  const handleQuestComplete = useCallback(
    (
      questId: number,
      result: {
        xpEarned: number;
        leveledUp: boolean;
        newLevel: number;
        newTotalXp: number;
        progress?: number;
        completed?: boolean;
        newlyUnlocked?: number[];
      },
    ) => {
      // Update XP and level
      if (result.newTotalXp > 0) {
        setCurrentXp(result.newTotalXp);
      }

      if (result.leveledUp) {
        setNewLevel(result.newLevel);
        setCurrentLevel(result.newLevel);
        setShowLevelUp(true);
      }

      // Trigger achievement celebration if newly unlocked
      if (result.newlyUnlocked && result.newlyUnlocked.length > 0) {
        setUnlockedIds(result.newlyUnlocked);
      }

      // Update quest state locally
      setLocalQuests((prev) => {
        const updated = prev.map((q) => {
          if (q.id !== questId) return q;
          return {
            ...q,
            completed: result.completed ?? true,
            progress: result.progress ?? q.targetCount,
            xpEarned: result.xpEarned,
          };
        });

        // Re-sort: incomplete first by xpReward desc, then completed
        return updated.sort((a, b) => {
          if (a.completed === b.completed) return b.xpReward - a.xpReward;
          return a.completed ? 1 : -1;
        });
      });
    },
    [],
  );

  return (
    <div className="relative flex flex-col gap-4">
      {/* Level Up overlay */}
      <LevelUpFlash
        show={showLevelUp}
        level={newLevel}
        onComplete={() => setShowLevelUp(false)}
      />

      {/* Achievement Unlock celebration */}
      <AchievementUnlock
        achievementIds={unlockedIds}
        achievementMap={achievementMap}
        onComplete={() => setUnlockedIds([])}
      />

      {/* Streak Hero Banner */}
      <StreakBanner
        streak={streakState}
        level={currentLevel}
        totalXp={currentXp}
      />

      {/* Quest list */}
      <h2 className="font-heading text-[14px] text-text mt-2">
        TODAY&apos;S QUESTS
      </h2>

      <div className="flex flex-col gap-3">
        {localQuests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            multiplier={multiplier}
            onComplete={(result) => handleQuestComplete(quest.id, result)}
          />
        ))}
      </div>

      {localQuests.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-8">
          <img
            src="/assets/empty-quests.svg"
            alt="No quests"
            width={200}
            height={160}
          />
          <p className="font-body text-text-dim text-[12px] text-center">
            No quests available today
          </p>
        </div>
      )}
    </div>
  );
}
