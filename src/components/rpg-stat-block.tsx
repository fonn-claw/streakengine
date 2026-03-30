"use client";

import { PixelCard } from "@/components/ui/pixel-card";

interface RPGStatBlockProps {
  stats: {
    str: number;
    int: number;
    dex: number;
    cha: number;
  };
}

const STAT_CONFIG = [
  { key: "str" as const, label: "STR", fullName: "Strength", color: "bg-danger" },
  { key: "int" as const, label: "INT", fullName: "Intelligence", color: "bg-primary" },
  { key: "dex" as const, label: "DEX", fullName: "Dexterity", color: "bg-secondary" },
  { key: "cha" as const, label: "CHA", fullName: "Charisma", color: "bg-accent" },
];

export function RPGStatBlock({ stats }: RPGStatBlockProps) {
  return (
    <div>
      <h2 className="font-heading text-[11px] text-text mb-3">STATS</h2>
      <PixelCard className="flex flex-col gap-3">
        {STAT_CONFIG.map(({ key, label, fullName, color }) => {
          const value = stats[key];
          const filledSegments = Math.round(value / 10);

          return (
            <div key={key} className="flex items-center gap-2">
              {/* Stat label */}
              <div className="w-10 flex-shrink-0">
                <div className="font-heading text-[10px] text-text">{label}</div>
                <div className="font-body text-[8px] text-text-dim">{fullName}</div>
              </div>

              {/* Pixel bar: 10 segments */}
              <div className="flex gap-[2px] flex-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-3 flex-1 border border-border ${
                      i < filledSegments ? color : "bg-surface-raised"
                    }`}
                  />
                ))}
              </div>

              {/* Value */}
              <span className="font-heading text-[10px] text-text w-8 text-right">
                {value}
              </span>
            </div>
          );
        })}
      </PixelCard>
    </div>
  );
}
