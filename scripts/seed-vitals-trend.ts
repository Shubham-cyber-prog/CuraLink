import { prisma } from '../src/lib/prisma';

async function seedVitalsTrend() {
  console.log('Seeding 21-day longitudinal vitals trend data...');

  // Find demo patient
  let patient = await prisma.user.findFirst({
    where: { email: 'patient@curalink.com' },
  });

  if (!patient) {
    patient = await prisma.user.findFirst({
      where: { role: 'PATIENT' },
    });
  }

  if (!patient) {
    console.error('No patient found in database to seed vitals for.');
    return;
  }

  console.log(`Seeding vitals for patient: ${patient.name} (${patient.email}, id: ${patient.id})`);

  // Clear existing vitals for this patient so seed is clean and deterministic
  await (prisma as any).vitalLog.deleteMany({
    where: { userId: patient.id },
  });

  const now = new Date();
  const logsToCreate = [];

  // Generate 21 days of daily vital readings
  // Day -20 to Day 0
  // Glucose rises from ~104 mg/dL to ~148 mg/dL (demonstrating steady 14-21 day deterioration drift)
  for (let i = 20; i >= 0; i--) {
    const logDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    logDate.setHours(8, 30, 0, 0); // 8:30 AM morning fasting log

    // 21-day progression:
    // Day 0 to 5: 102 - 107 mg/dL
    // Day 6 to 12: 112 - 124 mg/dL
    // Day 13 to 20: 130 - 148 mg/dL
    const dayIndex = 20 - i;
    let baseGlucose = 104;
    if (dayIndex >= 6 && dayIndex < 12) {
      baseGlucose = 114 + (dayIndex - 6) * 1.8;
    } else if (dayIndex >= 12) {
      baseGlucose = 125 + (dayIndex - 12) * 2.5;
    } else {
      baseGlucose = 102 + dayIndex * 0.8;
    }

    // Add slight realistic natural variation (+/- 2.5 mg/dL)
    const variation = ((dayIndex * 7) % 5) - 2;
    const glucose = Math.round((baseGlucose + variation) * 10) / 10;

    // Blood pressure: slight upward creep (118 -> 132 mmHg systolic)
    const systolicBp = Math.round(118 + dayIndex * 0.7 + (((dayIndex * 3) % 4) - 2));
    const diastolicBp = Math.round(76 + dayIndex * 0.35 + (((dayIndex * 5) % 3) - 1));

    // Weight: 68.2 to 69.1 kg
    const weight = Math.round((68.2 + dayIndex * 0.045) * 10) / 10;

    const heartRate = 72 + ((dayIndex * 2) % 6);
    const spO2 = 98 + (dayIndex % 2);

    logsToCreate.push({
      userId: patient.id,
      bloodGlucose: glucose,
      glucoseType: 'FASTING',
      systolicBp,
      diastolicBp,
      weight,
      heartRate,
      spO2,
      temperature: 98.6,
      notes: dayIndex === 20 ? 'Feeling a bit fatigued this morning' : null,
      recordedAt: logDate,
    });
  }

  for (const log of logsToCreate) {
    await (prisma as any).vitalLog.create({ data: log });
  }

  console.log(`Successfully seeded ${logsToCreate.length} longitudinal vital records for ${patient.name}!`);
  console.log(`Fasting Blood Glucose range: ${logsToCreate[0].bloodGlucose} mg/dL -> ${logsToCreate[logsToCreate.length - 1].bloodGlucose} mg/dL (Rising Trend)`);
}

seedVitalsTrend()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
