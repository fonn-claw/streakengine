"use client";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  trigger: string;
  category: string;
  xpReward: number;
  unlockedAt: Date | null;
}

interface AchievementGridProps {
  achievements: Achievement[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div>
      <h2 className="font-heading text-[11px] text-text mb-3">ACHIEVEMENTS</h2>
      <div className="grid grid-cols-3 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="aspect-square flex flex-col items-center justify-center relative pixel-border bg-surface p-2"
            style={{
              backgroundImage: "url(/assets/badge-frame.svg)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            {achievement.unlockedAt ? (
              <>
                <img
                  src={`/assets/${achievement.icon}`}
                  alt={achievement.name}
                  width={32}
                  height={32}
                  className="mb-1"
                />
                <span className="font-body text-[9px] text-text text-center leading-tight line-clamp-2">
                  {achievement.name}
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center bg-surface-raised w-full h-full">
                <img
                  src="/assets/icon-lock.svg"
                  alt="Locked"
                  width={24}
                  height={24}
                  className="mb-1 opacity-50"
                />
                <span className="font-heading text-[16px] text-text-dim">?</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
