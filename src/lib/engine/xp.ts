/**
 * XP and leveling calculations — pure functions, zero DB imports.
 *
 * Level threshold formula (from CONTEXT.md):
 *   Level N = sum(i=1..N) of (i*100 + (i-1)*50)
 *   Level 1 = 100, Level 2 = 350, Level 3 = 750, Level 4 = 1300, Level 5 = 2000
 */

/** Apply streak multiplier to base habit XP */
export function calculateXP(baseXP: number, multiplier: number): number {
  return Math.round(baseXP * multiplier);
}

/** Cumulative XP threshold required to reach a given level */
export function xpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += i * 100 + (i - 1) * 50;
  }
  return total;
}

/** Highest level achievable with the given total XP. 0 XP = level 0. */
export function getLevelFromXP(totalXP: number): number {
  let level = 0;
  while (xpForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

/** Progress info for rendering the XP bar */
export function getLevelProgress(totalXP: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressXP: number;
} {
  const level = getLevelFromXP(totalXP);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  return {
    level,
    currentLevelXP,
    nextLevelXP,
    progressXP: totalXP - currentLevelXP,
  };
}
