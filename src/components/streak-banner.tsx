"use client";

import { StreakFlame } from "@/components/animations/streak-pulse";
import { XPBar } from "@/components/xp-bar";
import { getLevelProgress } from "@/lib/engine/xp";
import { PixelCard } from "@/components/ui/pixel-card";
import type { StreakState } from "@/lib/queries/streaks";

interface StreakBannerProps {
  streak: StreakState;
  level: number;
  totalXp: number;
}

export function StreakBanner({ streak, level, totalXp }: StreakBannerProps) {
  const progress = getLevelProgress(totalXp);

  return (
    <PixelCard className="w-full">
      {/* Top row: flame + streak count + label + multiplier */}
      <div className="flex items-center gap-3">
        <StreakFlame
          active={streak.currentStreak > 0}
          atRisk={streak.currentStreak > 0 && !streak.freezeAvailable}
        />
        <span className="font-heading text-primary text-[32px]">
          {streak.currentStreak}
        </span>
        <span className="font-body text-text-dim text-[12px]">day streak</span>
        {streak.multiplier > 1.0 && (
          <span className="font-heading text-secondary text-[10px] pixel-border px-2 py-1">
            {streak.multiplier}x
          </span>
        )}
      </div>

      {/* XP bar row */}
      <div className="flex items-center gap-2 mt-3">
        <span className="font-heading text-text text-[10px]">
          LV.{level}
        </span>
        <XPBar
          current={progress.progressXP}
          total={progress.nextLevelXP - progress.currentLevelXP}
        />
        <span className="font-heading text-secondary text-[10px] whitespace-nowrap">
          {totalXp} XP
        </span>
      </div>

      {/* Freeze indicator */}
      {streak.freezeAvailable && (
        <div className="flex items-center gap-1 mt-2">
          <img
            src="/assets/icon-freeze.svg"
            alt="Freeze"
            width={16}
            height={16}
          />
          <span className="font-body text-accent text-[10px]">
            1 freeze available
          </span>
        </div>
      )}

      {/* Freeze message */}
      {streak.freezeMessage && (
        <p className="font-body text-accent text-[11px] mt-1">
          {streak.freezeMessage}
        </p>
      )}
    </PixelCard>
  );
}
