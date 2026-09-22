import { prisma } from '../src/lib/prisma';
import { VitalsAiService } from '../src/services/vitals-ai.service';

async function main() {
  const patient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
  if (!patient) {
    console.log('No patient found.');
    return;
  }
  const logs = await (prisma as any).vitalLog.findMany({
    where: { userId: patient.id },
    orderBy: { recordedAt: 'asc' },
  });

  console.log(`Analyzing ${logs.length} logs for ${patient.name}...`);
  const report = VitalsAiService.analyzeVitals(logs);

  console.log('\n=== AI LONGITUDINAL HEALTH REPORT ===');
  console.log('Overall Trajectory:', report.overallTrajectory);
  console.log('Summary English:', report.summaryText);
  console.log('Summary Hindi:', report.summaryTextHindi);
  console.log('\nGlucose Insights:', report.metricInsights.glucose);
  console.log('BP Insights:', report.metricInsights.bloodPressure);
  console.log('\nActive Clinical Alerts:');
  for (const alert of report.alerts) {
    console.log(`\n[${alert.severity}] ${alert.title}`);
    console.log(`Title (Hindi): ${alert.titleHindi}`);
    console.log(`Message: ${alert.message}`);
    console.log(`Message (Hindi): ${alert.messageHindi}`);
    console.log(`Action: ${alert.recommendedAction}`);
    console.log(`Suggest Doctor Booking: ${alert.suggestDoctorConsultation}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
