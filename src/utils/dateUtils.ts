/** Local midnight of today (device date). */
export function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Local midnight of the calendar day an ISO datetime falls on. */
export function startOfDay(iso: string): Date {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** True when the local calendar day of `iso` is strictly before today. */
export function isPastDate(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return startOfDay(iso).getTime() < todayStart().getTime();
}

/** "YYYY-MM-DD" local calendar-day key for an ISO datetime. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** True when two ISO datetimes fall on the same local calendar day. */
export function sameDay(a: string, b: string): boolean {
  return dayKey(a) === dayKey(b);
}

/**
 * ISO strings (local midnight) for a rolling window of `count` days
 * starting from today. Tomorrow the same call starts a day later.
 */
export function rollingDates(count = 7): string[] {
  const today = todayStart();
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString();
  });
}
