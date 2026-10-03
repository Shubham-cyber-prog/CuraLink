import prisma from '../src/lib/prisma';
import { zonedTimeToUtc, DEFAULT_APP_TIMEZONE, isValidIanaTimezone } from '../src/utils/timezone';

export interface BackfillReport {
  totalAppointments: number;
  alreadyMigrated: number;
  successfullyMigrated: number;
  failedOrInvalid: number;
  invalidRecords: Array<{
    id: string;
    date: string;
    time: string;
    reason: string;
  }>;
}

export async function backfillAppointmentTimezones(
  defaultTimezone: string = DEFAULT_APP_TIMEZONE,
  dryRun: boolean = false
): Promise<BackfillReport> {
  if (!isValidIanaTimezone(defaultTimezone)) {
    throw new Error(`Invalid IANA timezone specified for backfill: ${defaultTimezone}`);
  }

  console.log(`[Backfill] Starting appointment timezone backfill (default timezone: ${defaultTimezone}, dryRun: ${dryRun})...`);

  const allAppointments = await prisma.appointment.findMany({
    select: {
      id: true,
      date: true,
      time: true,
      scheduledAt: true,
      endTime: true,
      durationMinutes: true,
      timezone: true,
    },
  });

  const report: BackfillReport = {
    totalAppointments: allAppointments.length,
    alreadyMigrated: 0,
    successfullyMigrated: 0,
    failedOrInvalid: 0,
    invalidRecords: [],
  };

  for (const apt of allAppointments) {
    // If already populated with valid UTC timestamps, skip
    if (apt.scheduledAt && apt.endTime) {
      report.alreadyMigrated++;
      continue;
    }

    const aptTimezone = apt.timezone && isValidIanaTimezone(apt.timezone) ? apt.timezone : defaultTimezone;
    const utcStart = zonedTimeToUtc(apt.date, apt.time, aptTimezone);

    if (!utcStart) {
      report.failedOrInvalid++;
      report.invalidRecords.push({
        id: apt.id,
        date: apt.date,
        time: apt.time,
        reason: `Could not parse date "${apt.date}" and time "${apt.time}" into a valid UTC timestamp in timezone "${aptTimezone}". Record left unchanged.`,
      });
      continue;
    }

    const duration = apt.durationMinutes || 30;
    const utcEnd = new Date(utcStart.getTime() + duration * 60 * 1000);

    if (!dryRun) {
      await prisma.appointment.update({
        where: { id: apt.id },
        data: {
          scheduledAt: utcStart,
          endTime: utcEnd,
          durationMinutes: duration,
          timezone: aptTimezone,
        },
      });
    }

    report.successfullyMigrated++;
  }

  console.log('\n================ BACKFILL REPORT ================');
  console.log(`Total appointments in DB:     ${report.totalAppointments}`);
  console.log(`Already migrated:             ${report.alreadyMigrated}`);
  console.log(`Successfully migrated:        ${report.successfullyMigrated}`);
  console.log(`Failed / Invalid records:     ${report.failedOrInvalid}`);
  if (report.invalidRecords.length > 0) {
    console.log('\nInvalid records details:');
    report.invalidRecords.forEach((r) => {
      console.log(`  - ID: ${r.id} | Date: "${r.date}" | Time: "${r.time}" | Reason: ${r.reason}`);
    });
  }
  console.log('=================================================\n');

  return report;
}

if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  backfillAppointmentTimezones(DEFAULT_APP_TIMEZONE, isDryRun)
    .catch((err) => {
      console.error('[Backfill Error]:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
