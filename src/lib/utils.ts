/**
 * Timezone-safe date helpers and general utilities.
 */

import { startOfWeek, endOfWeek, format } from "date-fns";

/** Today's date string in the user's timezone ("YYYY-MM-DD") */
export function getTodayForUser(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Yesterday's date string in the user's timezone ("YYYY-MM-DD") */
export function getYesterdayForUser(timezone: string): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Monday and Sunday bounds for the week containing the given date string */
export function getWeekBounds(date: string): { start: string; end: string } {
  const d = new Date(date + "T12:00:00Z"); // noon UTC to avoid timezone edge issues
  const monday = startOfWeek(d, { weekStartsOn: 1 });
  const sunday = endOfWeek(d, { weekStartsOn: 1 });
  return {
    start: format(monday, "yyyy-MM-dd"),
    end: format(sunday, "yyyy-MM-dd"),
  };
}
