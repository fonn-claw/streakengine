"use client";

interface HabitXPEntry {
  habitName: string;
  habitIcon: string | null;
  totalXp: number;
}

interface HabitXPBreakdownProps {
  habits: HabitXPEntry[];
}

const HABIT_COLORS: Record<string, string> = {
  exercise: "bg-danger",
  meditation: "bg-primary",
  water: "bg-secondary",
  sleep: "bg-accent",
};

function getHabitColor(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(HABIT_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return "bg-xp-bar";
}

export function HabitXPBreakdown({ habits }: HabitXPBreakdownProps) {
  const maxXp = Math.max(...habits.map((h) => h.totalXp), 1);

  return (
    <div>
      <h2 className="font-heading text-[11px] text-text mb-3">XP BREAKDOWN</h2>

      {habits.length === 0 ? (
        <p className="font-body text-text-dim text-[11px]">No data yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => {
            const widthPercent = Math.round((habit.totalXp / maxXp) * 100);
            const color = getHabitColor(habit.habitName);
            const iconSrc = habit.habitIcon
              ? `/assets/${habit.habitIcon}.svg`
              : "/assets/icon-xp-star.svg";

            return (
              <div key={habit.habitName} className="flex items-center gap-2">
                {/* Icon + name */}
                <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                  <img
                    src={iconSrc}
                    alt={habit.habitName}
                    width={16}
                    height={16}
                  />
                  <span className="font-body text-[11px] text-text truncate">
                    {habit.habitName}
                  </span>
                </div>

                {/* Horizontal pixel bar */}
                <div className="flex-1 h-3 bg-surface-raised border border-border relative">
                  <div
                    className={`h-full ${color}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>

                {/* XP value */}
                <span className="font-heading text-[10px] text-text-dim w-16 text-right">
                  {habit.totalXp} XP
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
