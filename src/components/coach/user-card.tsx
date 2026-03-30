"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { PixelCard } from "@/components/ui/pixel-card";
import { PixelButton } from "@/components/ui/pixel-button";
import { HabitHeatmap } from "@/components/coach/habit-heatmap";
import { fetchUserDetail } from "@/lib/actions/coach";
import { sendNudge } from "@/lib/actions/social";
import type { CoachUserCard, HabitDay } from "@/lib/queries/coach";

export function UserCard({ user }: { user: CoachUserCard }) {
  const [expanded, setExpanded] = useState(false);
  const [heatmapData, setHeatmapData] = useState<HabitDay[] | null>(null);
  const [localNudgedToday, setLocalNudgedToday] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (!expanded && heatmapData === null) {
      startTransition(async () => {
        const data = await fetchUserDetail(user.userId);
        setHeatmapData(data);
      });
    }
    setExpanded((prev) => !prev);
  }

  function handleNudge(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      const result = await sendNudge(user.userId);
      if (result.sent) {
        setLocalNudgedToday(true);
      }
    });
  }

  const lastActive = user.lastActiveDate
    ? formatDistanceToNow(new Date(user.lastActiveDate + "T12:00:00Z"), {
        addSuffix: true,
      })
    : "Never";

  const nudgeDisabled = user.nudgedToday || localNudgedToday;

  return (
    <PixelCard className="cursor-pointer" onClick={handleToggle}>
      {/* Summary row */}
      <div className="flex items-start justify-between">
        <span className="font-heading text-[12px] text-primary">
          {user.displayName}
        </span>
        <motion.img
          src={`/assets/icon-heart-${user.riskLevel}.svg`}
          alt={user.riskLevel}
          width={24}
          height={24}
          {...(user.riskLevel === "red"
            ? {
                animate: { scale: [1, 1.05, 1] },
                transition: { repeat: Infinity, duration: 2 },
              }
            : {})}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mt-2">
        <span className="flex items-center gap-1">
          <img src="/assets/icon-flame.svg" alt="" width={16} height={16} />
          <span className="font-heading text-[11px] text-text">
            {user.currentStreak}
          </span>
        </span>
        <span className="font-body text-[11px] text-accent">
          {user.weeklyXp} XP
        </span>
        <span className="font-body text-[10px] text-text-dim">
          {lastActive}
        </span>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border">
              {heatmapData === null ? (
                <p className="font-body text-[10px] text-text-dim">
                  Loading...
                </p>
              ) : (
                <HabitHeatmap data={heatmapData} />
              )}

              <div className="mt-3">
                <PixelButton
                  variant="secondary"
                  size="sm"
                  disabled={nudgeDisabled || isPending}
                  onClick={handleNudge}
                >
                  <span className="flex items-center gap-1">
                    <img
                      src="/assets/icon-nudge.svg"
                      alt=""
                      width={14}
                      height={14}
                    />
                    {nudgeDisabled ? "NUDGED" : "SEND NUDGE"}
                  </span>
                </PixelButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PixelCard>
  );
}

export default UserCard;
