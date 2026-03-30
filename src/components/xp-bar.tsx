"use client";

import clsx from "clsx";

interface XPBarProps {
  current: number;
  total: number;
  segments?: number;
}

export function XPBar({ current, total, segments = 20 }: XPBarProps) {
  const filledCount = total > 0 ? Math.floor((current / total) * segments) : 0;

  return (
    <div className="flex gap-[2px] flex-1">
      {Array.from({ length: segments }, (_, i) => (
        <div
          key={i}
          className={clsx(
            "h-3 flex-1 border border-border",
            i < filledCount ? "bg-xp-bar" : "bg-surface-raised"
          )}
        />
      ))}
    </div>
  );
}
