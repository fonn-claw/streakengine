"use client";

import type { HabitDay } from "@/lib/queries/coach";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function HabitHeatmap({ data }: { data: HabitDay[] }) {
  if (data.length === 0) {
    return (
      <p className="font-body text-[10px] text-text-dim py-2">No habit data</p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Day headers */}
      <div className="flex items-center gap-[2px]">
        <span className="w-16 shrink-0" />
        {DAY_LABELS.map((d, i) => (
          <span
            key={i}
            className="w-6 h-6 flex items-center justify-center font-body text-[10px] text-text-dim"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Habit rows */}
      {data.map((habit) => (
        <div key={habit.habitName} className="flex items-center gap-[2px]">
          <span className="w-16 shrink-0 font-body text-[10px] text-text-dim truncate">
            {habit.habitIcon ? (
              <img
                src={`/assets/${habit.habitIcon}${habit.habitIcon?.endsWith(".svg") ? "" : ".svg"}`}
                alt=""
                width={12}
                height={12}
                className="inline mr-1"
              />
            ) : null}
            {habit.habitName}
          </span>
          {habit.days.map((day) => (
            <span
              key={day.date}
              className={`w-6 h-6 ${
                day.completed
                  ? "bg-[var(--color-success)]"
                  : "bg-[var(--color-surface-raised)]"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default HabitHeatmap;
