import prisma from '../lib/prisma';
import { emailService } from '../services/email/email.service';

/**
 * Parses appointment date ('YYYY-MM-DD') and time ('HH:MM AM/PM') into a Date object.
 */
export function parseAppointmentDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const modifier = match[3]?.toUpperCase();

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const aptDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return isNaN(aptDate.getTime()) ? null : aptDate;
  } catch {
    return null;
  }
}

/**
 * Worker that processes and dispatches scheduled appointment reminders.
 * Idempotently checks appointment_reminders table to prevent duplicate delivery.
 */
export class AppointmentReminderWorker {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  start(intervalMs = 10 * 60 * 1000) { // default 10 minutes
    console.log('⏰ [AppointmentReminderWorker] Initialized and active.');
    // Run initial scan shortly after startup
    setTimeout(() => this.processReminders().catch((err) => console.error('[AppointmentReminderWorker] Initial scan error:', err)), 5000);
    this.timer = setInterval(() => this.processReminders().catch((err) => console.error('[AppointmentReminderWorker] Interval error:', err)), intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async processReminders() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      // Lookahead window: up to 26 hours in the future
      const futureWindow = new Date(now.getTime() + 26 * 60 * 60 * 1000);
      const todayStr = now.toISOString().split('T')[0];
      const tomorrowStr = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Find all confirmed appointments today and tomorrow
      const appointments = await prisma.appointment.findMany({
        where: {
          status: 'CONFIRMED',
          date: { in: [todayStr, tomorrowStr] },
        },
        include: {
          reminders: true,
        },
      });

      for (const apt of appointments) {
        const aptDateTime = parseAppointmentDateTime(apt.date, apt.time);
        if (!aptDateTime) continue;

        const diffMs = aptDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // 1. Check 24-Hour Reminder (Between 23h and 25h away)
        if (diffHours > 0 && diffHours <= 25 && diffHours >= 22) {
          await this.dispatchReminder(apt.id, '24H', aptDateTime);
        }

        // 2. Check 1-Hour Reminder (Between 0.5h and 1.5h away)
        if (diffHours > 0 && diffHours <= 1.5) {
          await this.dispatchReminder(apt.id, '1H', aptDateTime);
        }
      }
    } catch (err: any) {
      console.error('[AppointmentReminderWorker] Error in reminder sweep:', err?.message || err);
    } finally {
      this.isProcessing = false;
    }
  }

  private async dispatchReminder(appointmentId: string, reminderType: '24H' | '1H', aptDateTime: Date) {
    // Atomically claim reminder to avoid race conditions across cluster/instances
    try {
      const existing = await prisma.appointmentReminder.findUnique({
        where: {
          appointmentId_reminderType: {
            appointmentId,
            reminderType,
          },
        },
      });

      if (existing) {
        // Already recorded/sent
        return;
      }

      // Create reminder record in PENDING state
      const reminder = await prisma.appointmentReminder.create({
        data: {
          appointmentId,
          reminderType,
          scheduledFor: aptDateTime,
          status: 'PENDING',
        },
      });

      // Send the email notifications
      await emailService.sendAppointmentReminderEmail(appointmentId, reminderType);

      // Mark as SENT
      await prisma.appointmentReminder.update({
        where: { id: reminder.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      console.log(`[AppointmentReminderWorker] 📧 Dispatched ${reminderType} reminder for appointment ${appointmentId}`);
    } catch (err: any) {
      if (err?.code === 'P2002') {
        // Unique constraint conflict - another worker handled it concurrently
        return;
      }
      console.error(`[AppointmentReminderWorker] Failed to dispatch ${reminderType} reminder for ${appointmentId}:`, err?.message || err);
    }
  }
}

export const appointmentReminderWorker = new AppointmentReminderWorker();
