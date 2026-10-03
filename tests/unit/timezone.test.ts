import {
  zonedTimeToUtc,
  utcToZonedFormatted,
  isIntervalOverlapping,
  parseTimeTo24Hour,
  isValidIanaTimezone,
  DEFAULT_APP_TIMEZONE,
} from '../../src/utils/timezone';
import { ConsultationService } from '../../src/services/consultation.service';

describe('Timezone & DateTime Utility Tests', () => {
  describe('IANA Timezone Validation', () => {
    it('should validate standard IANA timezones', () => {
      expect(isValidIanaTimezone('Asia/Kolkata')).toBe(true);
      expect(isValidIanaTimezone('America/New_York')).toBe(true);
      expect(isValidIanaTimezone('Europe/London')).toBe(true);
      expect(isValidIanaTimezone('UTC')).toBe(true);
      expect(isValidIanaTimezone('Asia/Tokyo')).toBe(true);
    });

    it('should reject invalid or malformed timezones', () => {
      expect(isValidIanaTimezone('Mars/Olympus')).toBe(false);
      expect(isValidIanaTimezone('Invalid/Zone')).toBe(false);
      expect(isValidIanaTimezone('')).toBe(false);
      expect(isValidIanaTimezone(null as any)).toBe(false);
    });
  });

  describe('Time String Parser (parseTimeTo24Hour)', () => {
    it('should parse 12-hour AM/PM formats', () => {
      expect(parseTimeTo24Hour('10:30 AM')).toEqual({ hours: 10, minutes: 30 });
      expect(parseTimeTo24Hour('04:15 PM')).toEqual({ hours: 16, minutes: 15 });
      expect(parseTimeTo24Hour('11:59 pm')).toEqual({ hours: 23, minutes: 59 });
    });

    it('should handle Midnight and Noon in 12-hour format correctly', () => {
      // Midnight 12:00 AM -> 00:00
      expect(parseTimeTo24Hour('12:00 AM')).toEqual({ hours: 0, minutes: 0 });
      expect(parseTimeTo24Hour('12:30 AM')).toEqual({ hours: 0, minutes: 30 });

      // Noon 12:00 PM -> 12:00
      expect(parseTimeTo24Hour('12:00 PM')).toEqual({ hours: 12, minutes: 0 });
      expect(parseTimeTo24Hour('12:45 PM')).toEqual({ hours: 12, minutes: 45 });
    });

    it('should parse 24-hour formats', () => {
      expect(parseTimeTo24Hour('00:00')).toEqual({ hours: 0, minutes: 0 });
      expect(parseTimeTo24Hour('14:30')).toEqual({ hours: 14, minutes: 30 });
      expect(parseTimeTo24Hour('09:05')).toEqual({ hours: 9, minutes: 5 });
      expect(parseTimeTo24Hour('23:59')).toEqual({ hours: 23, minutes: 59 });
    });

    it('should reject invalid times', () => {
      expect(parseTimeTo24Hour('25:00')).toBeNull();
      expect(parseTimeTo24Hour('12:60 PM')).toBeNull();
      expect(parseTimeTo24Hour('0:30 AM')).toBeNull(); // 12-hour hours must be 1-12
      expect(parseTimeTo24Hour('invalid')).toBeNull();
      expect(parseTimeTo24Hour('')).toBeNull();
    });
  });

  describe('Zoned Time to UTC Conversion (zonedTimeToUtc)', () => {
    it('should correctly convert Asia/Kolkata (UTC+5:30) times', () => {
      // 10:30 AM IST = 05:00 UTC
      const utc1 = zonedTimeToUtc('2026-09-28', '10:30 AM', 'Asia/Kolkata');
      expect(utc1).not.toBeNull();
      expect(utc1!.toISOString()).toBe('2026-09-28T05:00:00.000Z');

      // 03:00 PM IST = 09:30 UTC
      const utc2 = zonedTimeToUtc('2026-09-28', '03:00 PM', 'Asia/Kolkata');
      expect(utc2).not.toBeNull();
      expect(utc2!.toISOString()).toBe('2026-09-28T09:30:00.000Z');

      // Midnight 12:00 AM IST on Sep 28 = Sep 27 18:30 UTC
      const utcMidnight = zonedTimeToUtc('2026-09-28', '12:00 AM', 'Asia/Kolkata');
      expect(utcMidnight).not.toBeNull();
      expect(utcMidnight!.toISOString()).toBe('2026-09-27T18:30:00.000Z');

      // Noon 12:00 PM IST on Sep 28 = Sep 28 06:30 UTC
      const utcNoon = zonedTimeToUtc('2026-09-28', '12:00 PM', 'Asia/Kolkata');
      expect(utcNoon).not.toBeNull();
      expect(utcNoon!.toISOString()).toBe('2026-09-28T06:30:00.000Z');
    });

    it('should correctly convert 24-hour format in Asia/Kolkata', () => {
      // 14:30 IST = 09:00 UTC
      const utc = zonedTimeToUtc('2026-09-28', '14:30', 'Asia/Kolkata');
      expect(utc).not.toBeNull();
      expect(utc!.toISOString()).toBe('2026-09-28T09:00:00.000Z');
    });

    it('should handle America/New_York (EST and EDT) and DST transitions', () => {
      // Summer: July 15 (EDT, UTC-4) -> 12:00 PM EDT = 16:00 UTC
      const summerUtc = zonedTimeToUtc('2026-07-15', '12:00 PM', 'America/New_York');
      expect(summerUtc).not.toBeNull();
      expect(summerUtc!.toISOString()).toBe('2026-07-15T16:00:00.000Z');

      // Winter: January 15 (EST, UTC-5) -> 12:00 PM EST = 17:00 UTC
      const winterUtc = zonedTimeToUtc('2026-01-15', '12:00 PM', 'America/New_York');
      expect(winterUtc).not.toBeNull();
      expect(winterUtc!.toISOString()).toBe('2026-01-15T17:00:00.000Z');

      // Midnight in New York in January (EST, UTC-5): Jan 15 12:00 AM -> Jan 15 05:00 UTC
      const nyMidnight = zonedTimeToUtc('2026-01-15', '12:00 AM', 'America/New_York');
      expect(nyMidnight).not.toBeNull();
      expect(nyMidnight!.toISOString()).toBe('2026-01-15T05:00:00.000Z');
    });

    it('should reject non-existent calendar dates', () => {
      // Feb 30 does not exist
      expect(zonedTimeToUtc('2026-02-30', '10:00 AM', 'Asia/Kolkata')).toBeNull();
      // April 31 does not exist
      expect(zonedTimeToUtc('2026-04-31', '10:00 AM', 'Asia/Kolkata')).toBeNull();
      // Month 13 does not exist
      expect(zonedTimeToUtc('2026-13-10', '10:00 AM', 'Asia/Kolkata')).toBeNull();
    });

    it('should reject invalid timezone identifiers', () => {
      expect(zonedTimeToUtc('2026-09-28', '10:00 AM', 'Invalid/Timezone')).toBeNull();
    });
  });

  describe('UTC to Zoned Formatted Output (utcToZonedFormatted)', () => {
    it('should format UTC timestamp back into local date and time strings in Asia/Kolkata', () => {
      const utcDate = new Date('2026-09-28T05:00:00.000Z');
      const formatted = utcToZonedFormatted(utcDate, 'Asia/Kolkata');
      expect(formatted.date).toBe('2026-09-28');
      expect(formatted.time).toMatch(/10:30\s*AM/i);
    });

    it('should format UTC timestamp into America/New_York in summer', () => {
      const utcDate = new Date('2026-07-15T16:00:00.000Z');
      const formatted = utcToZonedFormatted(utcDate, 'America/New_York');
      expect(formatted.date).toBe('2026-07-15');
      expect(formatted.time).toMatch(/12:00\s*PM/i);
    });
  });

  describe('Interval Overlap Logic (isIntervalOverlapping)', () => {
    const aStart = new Date('2026-09-28T10:00:00.000Z');
    const aEnd = new Date('2026-09-28T10:30:00.000Z');

    it('should detect identical intervals as overlapping', () => {
      expect(isIntervalOverlapping(aStart, aEnd, aStart, aEnd)).toBe(true);
    });

    it('should detect partial overlap (starting before, ending during)', () => {
      const bStart = new Date('2026-09-28T09:45:00.000Z');
      const bEnd = new Date('2026-09-28T10:15:00.000Z');
      expect(isIntervalOverlapping(aStart, aEnd, bStart, bEnd)).toBe(true);
      expect(isIntervalOverlapping(bStart, bEnd, aStart, aEnd)).toBe(true);
    });

    it('should detect contained intervals as overlapping', () => {
      const bStart = new Date('2026-09-28T10:05:00.000Z');
      const bEnd = new Date('2026-09-28T10:25:00.000Z');
      expect(isIntervalOverlapping(aStart, aEnd, bStart, bEnd)).toBe(true);
    });

    it('should NOT treat touching/adjacent intervals as overlapping (half-open [start, end))', () => {
      // B starts exactly when A ends
      const bStart = new Date('2026-09-28T10:30:00.000Z');
      const bEnd = new Date('2026-09-28T11:00:00.000Z');
      expect(isIntervalOverlapping(aStart, aEnd, bStart, bEnd)).toBe(false);
      expect(isIntervalOverlapping(bStart, bEnd, aStart, aEnd)).toBe(false);
    });

    it('should NOT treat completely disjoint intervals as overlapping', () => {
      const bStart = new Date('2026-09-28T11:00:00.000Z');
      const bEnd = new Date('2026-09-28T11:30:00.000Z');
      expect(isIntervalOverlapping(aStart, aEnd, bStart, bEnd)).toBe(false);
    });
  });

  describe('Consultation Join Window (UTC Calculations)', () => {
    const consultationService = new ConsultationService();

    it('should allow joining within window (10 mins before to 60 mins after)', () => {
      // Force non-test check logic
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const now = Date.now();
      // Scheduled 5 minutes from now (within 10-minute pre-window)
      const scheduledAt = new Date(now + 5 * 60 * 1000);

      const check = consultationService.isWithinJoinWindow({
        scheduledAt,
        date: '2026-09-28',
        time: '10:00 AM',
      });

      expect(check.canJoin).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('should reject joining too early (> 10 mins before scheduled time)', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const now = Date.now();
      // Scheduled 30 minutes in the future
      const scheduledAt = new Date(now + 30 * 60 * 1000);

      const check = consultationService.isWithinJoinWindow({
        scheduledAt,
        date: '2026-09-28',
        time: '10:00 AM',
      });

      expect(check.canJoin).toBe(false);
      expect(check.reason).toContain('10 minutes prior');

      process.env.NODE_ENV = originalEnv;
    });

    it('should reject joining after consultation window expired (> 60 mins after scheduled time)', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const now = Date.now();
      // Scheduled 70 minutes ago
      const scheduledAt = new Date(now - 70 * 60 * 1000);

      const check = consultationService.isWithinJoinWindow({
        scheduledAt,
        date: '2026-09-28',
        time: '10:00 AM',
      });

      expect(check.canJoin).toBe(false);
      expect(check.reason).toContain('ended');

      process.env.NODE_ENV = originalEnv;
    });
  });
});
