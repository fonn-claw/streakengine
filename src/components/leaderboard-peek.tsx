"use client";

import { PixelCard } from "@/components/ui/pixel-card";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  weeklyXp: number;
  isCurrentUser: boolean;
}

interface LeaderboardPeekProps {
  entries: LeaderboardEntry[];
}

const trophyIcons: Record<number, string> = {
  1: "/assets/icon-trophy-gold.svg",
  2: "/assets/icon-trophy-silver.svg",
  3: "/assets/icon-trophy-bronze.svg",
};

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const trophy = trophyIcons[entry.rank];

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 ${
        entry.isCurrentUser
          ? "border-l-4 border-primary bg-surface-raised"
          : ""
      }`}
    >
      <span className="font-heading text-[10px] text-text-dim w-5 shrink-0">
        {entry.rank}
      </span>
      {trophy && (
        <img src={trophy} alt={`Rank ${entry.rank}`} width={16} height={16} />
      )}
      {entry.rank === 1 && (
        <img src="/assets/icon-crown.svg" alt="Crown" width={12} height={12} />
      )}
      <span className="font-body text-[11px] text-text truncate flex-1">
        {entry.displayName}
      </span>
      <span className="font-heading text-[10px] text-secondary shrink-0">
        {entry.weeklyXp.toLocaleString()} XP
      </span>
    </div>
  );
}

export function LeaderboardPeek({ entries }: LeaderboardPeekProps) {
  if (entries.length === 0) {
    return (
      <PixelCard>
        <div className="flex flex-col items-center gap-3 py-4">
          <img
            src="/assets/empty-quests.svg"
            alt="No competition"
            width={120}
            height={96}
          />
          <p className="font-body text-text-dim text-[11px]">
            No competition yet
          </p>
        </div>
      </PixelCard>
    );
  }

  const top3 = entries.slice(0, 3);
  const currentUser = entries.find((e) => e.isCurrentUser);
  const currentUserInTop3 = top3.some((e) => e.isCurrentUser);

  return (
    <PixelCard>
      <h3 className="font-heading text-[11px] text-text mb-2">WEEKLY BOARD</h3>
      <div className="flex flex-col gap-1">
        {top3.map((entry) => (
          <LeaderboardRow key={entry.userId} entry={entry} />
        ))}
        {!currentUserInTop3 && currentUser && (
          <>
            <div className="border-t border-border my-1" />
            <LeaderboardRow entry={currentUser} />
          </>
        )}
      </div>
      <p className="font-body text-text-dim text-[10px] mt-2">Resets Monday</p>
    </PixelCard>
  );
}
