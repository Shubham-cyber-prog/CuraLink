/**
 * Timezone & DateTime Utilities for CuraLink
 *
 * Implements explicit IANA timezone support with zero external library overhead,
 * utilizing ECMAScript Internationalization API (Intl.DateTimeFormat) available in Node 20+.
 *
 * Architecture Principles:
 * 1. Storage: All appointment timestamps (scheduledAt, endTime) are strictly stored in UTC.
 * 2. Business Timezone: Each appointment stores its explicit IANA timezone (defaulting to
 *    Asia/Kolkata for legacy records, but fully supporting any IANA timezone).
 * 3. Display: Formatting utilities convert UTC storage into the requested user display timezone.
 */

export const DEFAULT_APP_TIMEZONE = 'Asia/Kolkata';

/**
 * Validates if a string is a recognized IANA timezone identifier.
 */
export function isValidIanaTimezone(timeZone: string): boolean {
  if (!timeZone || typeof timeZone !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses 12-hour ("10:30 AM", "12:00 PM", "12:00 AM") or 24-hour ("14:30", "09:00") time strings.
 * Returns { hours: 0-23, minutes: 0-59 } or null if invalid.
 */
export function parseTimeTo24Hour(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const trimmed = timeStr.trim();

  // 12-Hour format (e.g. "10:00 AM", "12:00 PM", "04:30 pm")
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridian = match12[3].toUpperCase();

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
    if (meridian === 'AM' && hours === 12) hours = 0;
    if (meridian === 'PM' && hours < 12) hours += 12;

    return { hours, minutes };
  }

  // 24-Hour format (e.g. "14:30", "09:00", "00:00")
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return { hours, minutes };
  }

  return null;
}

/**
 * Converts a localized date ("YYYY-MM-DD") and time ("10:00 AM" or "14:30")
 * in an explicit IANA timezone into a UTC Date object.
 *
 * Returns null if the date, time, or timezone is invalid, or if the calendar date does not exist (e.g. Feb 30).
 */
export function zonedTimeToUtc(
  dateStr: string,
  timeStr: string,
  timeZone: string = DEFAULT_APP_TIMEZONE
): Date | null {
  if (!isValidIanaTimezone(timeZone)) return null;

  const dateMatch = (dateStr || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return null;

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);

  const timeParsed = parseTimeTo24Hour(timeStr);
  if (!timeParsed) return null;
  const { hours, minutes } = timeParsed;

  // Validate calendar date bounds (e.g. reject 2026-02-30 or 2026-04-31)
  const testDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
  if (
    testDate.getUTCFullYear() !== year ||
    testDate.getUTCMonth() !== month - 1 ||
    testDate.getUTCDate() !== day
  ) {
    return null;
  }

  // Find exact UTC timestamp such that Intl.DateTimeFormat in target timezone matches input wall clock
  let utcGuess = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Iterative convergence (handles daylight savings transitions and non-standard offsets)
  for (let i = 0; i < 4; i++) {
    const parts = formatter.formatToParts(new Date(utcGuess));
    const p: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== 'literal') p[part.type] = part.value;
    }

    const formattedYear = parseInt(p.year, 10);
    const formattedMonth = parseInt(p.month, 10);
    const formattedDay = parseInt(p.day, 10);
    let formattedHour = parseInt(p.hour, 10);
    if (formattedHour === 24) formattedHour = 0;
    const formattedMinute = parseInt(p.minute, 10);

    const formattedAsUtc = Date.UTC(
      formattedYear,
      formattedMonth - 1,
      formattedDay,
      formattedHour,
      formattedMinute,
      0,
      0
    );
    const targetAsUtc = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);

    const diff = targetAsUtc - formattedAsUtc;
    if (diff === 0) {
      break;
    }
    utcGuess += diff;
  }

  return new Date(utcGuess);
}

/**
 * Converts a UTC Date into a localized date string ("YYYY-MM-DD")
 * and 12-hour time string ("hh:mm A") in the target IANA timezone.
 */
export function utcToZonedFormatted(
  utcDate: Date,
  timeZone: string = DEFAULT_APP_TIMEZONE
): { date: string; time: string } {
  if (!isValidIanaTimezone(timeZone)) {
    timeZone = DEFAULT_APP_TIMEZONE;
  }

  // Format date parts as YYYY-MM-DD
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = dateFormatter.formatToParts(utcDate);
  const p: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') p[part.type] = part.value;
  }
  const date = `${p.year}-${p.month}-${p.day}`;

  // Format time as "hh:mm A" (e.g. "10:30 AM")
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const time = timeFormatter.format(utcDate);

  return { date, time };
}

/**
 * Mathematical interval overlap check:
 * Two half-open intervals [startA, endA) and [startB, endB) overlap if and only if:
 * startA < endB && endA > startB
 */
export function isIntervalOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}
