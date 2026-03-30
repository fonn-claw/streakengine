"use client";

import { PixelCard } from "@/components/ui/pixel-card";
import { XPBar } from "@/components/xp-bar";

interface ChallengeProgressProps {
  challenge: {
    id: number;
    name: string;
    description: string | null;
    targetXp: number;
  } | null;
  participants: {
    userId: number;
    displayName: string;
    currentXp: number;
  }[];
}

export function ChallengeProgress({
  challenge,
  participants,
}: ChallengeProgressProps) {
  if (!challenge) return null;

  const sorted = [...participants].sort((a, b) => b.currentXp - a.currentXp);

  return (
    <PixelCard>
      <h3 className="font-heading text-[11px] text-primary mb-3">
        {challenge.name}
      </h3>
      {challenge.description && (
        <p className="font-body text-[10px] text-text-dim mb-3">
          {challenge.description}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {sorted.map((p) => (
          <div key={p.userId} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-body text-[11px] text-text">
                {p.displayName}
              </span>
              <span className="font-heading text-[10px] text-secondary">
                {p.currentXp} / {challenge.targetXp} XP
              </span>
            </div>
            <XPBar
              current={p.currentXp}
              total={challenge.targetXp}
              segments={10}
            />
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
