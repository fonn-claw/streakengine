"use client";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  weeklyXp: number;
  isCurrentUser: boolean;
}

interface LeaderboardFullProps {
  entries: LeaderboardEntry[];
}

const trophyIcons: Record<number, string> = {
  1: "/assets/icon-trophy-gold.svg",
  2: "/assets/icon-trophy-silver.svg",
  3: "/assets/icon-trophy-bronze.svg",
};

export function LeaderboardFull({ entries }: LeaderboardFullProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <img
          src="/assets/empty-quests.svg"
          alt="No friends to compete with"
          width={200}
          height={160}
        />
        <p className="font-body text-text-dim text-[12px]">
          No friends to compete with
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {entries.map((entry) => {
          const trophy = trophyIcons[entry.rank];
          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 px-3 py-2 ${
                entry.isCurrentUser
                  ? "border-l-4 border-primary bg-surface-raised"
                  : ""
              }`}
            >
              <span className="font-heading text-[11px] text-text-dim w-6 shrink-0">
                {entry.rank}
              </span>
              {trophy && (
                <img
                  src={trophy}
                  alt={`Rank ${entry.rank}`}
                  width={16}
                  height={16}
                />
              )}
              {entry.rank === 1 && (
                <img
                  src="/assets/icon-crown.svg"
                  alt="Crown"
                  width={12}
                  height={12}
                />
              )}
              <span className="font-body text-[12px] text-text truncate flex-1">
                {entry.displayName}
              </span>
              <span className="font-heading text-[11px] text-secondary shrink-0">
                {entry.weeklyXp.toLocaleString()} XP
              </span>
            </div>
          );
        })}
      </div>
      <p className="font-body text-text-dim text-[10px] mt-3">Resets Monday</p>
    </div>
  );
}
