"use client";

import { useState, useTransition } from "react";
import { PixelCard } from "@/components/ui/pixel-card";
import { PixelButton } from "@/components/ui/pixel-button";
import { sendNudge } from "@/lib/actions/social";

interface FriendRowProps {
  friend: {
    userId: number;
    displayName: string;
    level: number;
    totalXp: number;
    currentStreak: number;
    lastActive: Date | null;
  };
}

function formatLastActive(lastActive: Date | null): string {
  if (!lastActive) return "Never";
  const now = new Date();
  const date = new Date(lastActive);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    if (diffHours < 1) return "Active just now";
    return `Active ${diffHours}h ago`;
  }
  if (diffDays === 1) return "Active yesterday";
  return `Active ${diffDays}d ago`;
}

export function FriendRow({ friend }: FriendRowProps) {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleNudge() {
    startTransition(async () => {
      const result = await sendNudge(friend.userId);
      if (result.sent || !result.sent) {
        setSent(true);
      }
    });
  }

  return (
    <PixelCard className="flex items-center gap-3">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-body text-[12px] text-text truncate">
          {friend.displayName}
        </span>
        <span className="font-heading text-[10px] text-text-dim">
          Lvl {friend.level}
        </span>
      </div>
      <div className="flex flex-col items-center shrink-0">
        <div className="flex items-center gap-1">
          <img
            src="/assets/icon-flame.svg"
            alt="Streak"
            width={14}
            height={14}
          />
          <span className="font-heading text-[11px] text-secondary">
            {friend.currentStreak}
          </span>
        </div>
        <span className="font-body text-[10px] text-text-dim">
          {formatLastActive(friend.lastActive)}
        </span>
      </div>
      <PixelButton
        variant="secondary"
        size="sm"
        onClick={handleNudge}
        disabled={sent || isPending}
        className="shrink-0"
      >
        <span className="flex items-center gap-1">
          <img
            src="/assets/icon-nudge.svg"
            alt=""
            width={14}
            height={14}
          />
          {sent ? (
            <span className="text-success">SENT!</span>
          ) : (
            "NUDGE"
          )}
        </span>
      </PixelButton>
    </PixelCard>
  );
}
