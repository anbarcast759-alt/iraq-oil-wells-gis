/**
 * Parses dates like "12/7/2019 10:00 AM" (D/M/YYYY H:MM AM/PM, as used
 * in Spud_Date/Completion_Date). Returns null instead of throwing so a
 * missing/malformed cell never breaks a chart or calculation.
 */
export function parseSheetDate(value: string | undefined | null): Date | null {
  if (!value || !value.trim()) return null;

  const match = value
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM)?)?$/i);
  if (!match) return null;

  const [, dayStr, monthStr, yearStr, hourStr, minStr, ampm] = match;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  let hour = hourStr ? parseInt(hourStr, 10) : 0;
  const minute = minStr ? parseInt(minStr, 10) : 0;

  if (ampm) {
    const isPM = /pm/i.test(ampm);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
  }

  const date = new Date(year, month - 1, day, hour, minute);
  return Number.isNaN(date.getTime()) ? null : date;
}
