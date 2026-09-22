/**
 * Utilities for calculating appointment timing, consultation windows,
 * and lifecycle status based on server timestamps (Asia/Kolkata timezone).
 */

export interface ConsultationWindowResult {
  canJoin: boolean;
  status: 'UPCOMING' | 'STARTING_SOON' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  reason?: string;
  startsAt?: Date;
  windowOpensAt?: Date;
  windowClosesAt?: Date;
}

export function parseAppointmentDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();

    if (dateStr && dateStr.toLowerCase() !== 'today') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-').map(Number);
        year = y;
        month = m - 1;
        day = d;
      } else {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          year = parsed.getFullYear();
          month = parsed.getMonth();
          day = parsed.getDate();
        }
      }
    }

    let hours = 0;
    let minutes = 0;
    const timeMatch = timeStr ? timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i) : null;
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const meridian = timeMatch[3];
      if (meridian) {
        if (meridian.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (meridian.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
    } else {
      return null;
    }

    return new Date(year, month, day, hours, minutes, 0, 0);
  } catch {
    return null;
  }
}

/**
 * Validates whether the appointment is currently eligible for joining video.
 * Standard join window: 10 minutes prior to scheduled start until 60 minutes after start.
 */
export function checkConsultationEligibility(
  dateStr: string,
  timeStr: string,
  dbStatus: string,
  bypassWindow: boolean = false
): ConsultationWindowResult {
  const upperStatus = (dbStatus || 'CONFIRMED').toUpperCase();

  if (upperStatus === 'CANCELLED') {
    return {
      canJoin: false,
      status: 'CANCELLED',
      reason: 'This appointment has been cancelled.',
    };
  }

  if (upperStatus === 'COMPLETED') {
    return {
      canJoin: false,
      status: 'COMPLETED',
      reason: 'This consultation has already been completed.',
    };
  }

  const apptDate = parseAppointmentDateTime(dateStr, timeStr);
  if (!apptDate) {
    // If date/time cannot be strictly parsed, allow join if confirmed
    return {
      canJoin: true,
      status: 'LIVE',
    };
  }

  const windowOpensAt = new Date(apptDate.getTime() - 10 * 60 * 1000);
  const windowClosesAt = new Date(apptDate.getTime() + 60 * 60 * 1000);
  const now = new Date();

  if (bypassWindow) {
    return {
      canJoin: true,
      status: 'LIVE',
      startsAt: apptDate,
      windowOpensAt,
      windowClosesAt,
    };
  }

  if (now < windowOpensAt) {
    return {
      canJoin: false,
      status: 'UPCOMING',
      reason: `Consultation room will be available 10 minutes prior to scheduled time (${timeStr}).`,
      startsAt: apptDate,
      windowOpensAt,
      windowClosesAt,
    };
  }

  if (now >= windowOpensAt && now < apptDate) {
    return {
      canJoin: true,
      status: 'STARTING_SOON',
      startsAt: apptDate,
      windowOpensAt,
      windowClosesAt,
    };
  }

  if (now >= apptDate && now <= windowClosesAt) {
    return {
      canJoin: true,
      status: 'LIVE',
      startsAt: apptDate,
      windowOpensAt,
      windowClosesAt,
    };
  }

  // After window
  return {
    canJoin: false,
    status: 'MISSED',
    reason: 'The scheduled consultation window for this appointment has expired.',
    startsAt: apptDate,
    windowOpensAt,
    windowClosesAt,
  };
}
