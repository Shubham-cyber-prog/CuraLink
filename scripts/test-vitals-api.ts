import { prisma } from '../src/lib/prisma';

async function testApi() {
  console.log('Testing Express /api/vitals endpoints...');

  try {
    // 1. GET /api/vitals/trends
    const resTrends = await fetch('http://localhost:5000/api/vitals/trends?days=30');
    console.log('GET /api/vitals/trends status:', resTrends.status);
    const dataTrends = await resTrends.json();
    console.log('Time series points count:', dataTrends.data?.timeSeries?.length);
    console.log('First point:', dataTrends.data?.timeSeries?.[0]?.date, dataTrends.data?.timeSeries?.[0]?.bloodGlucose, 'mg/dL');
    console.log('Last point:', dataTrends.data?.timeSeries?.[dataTrends.data?.timeSeries?.length - 1]?.date, dataTrends.data?.timeSeries?.[dataTrends.data?.timeSeries?.length - 1]?.bloodGlucose, 'mg/dL');
    console.log('Trajectory from trends:', dataTrends.data?.insights?.overallTrajectory);

    // 2. GET /api/vitals/ai-insights
    const resInsights = await fetch('http://localhost:5000/api/vitals/ai-insights');
    console.log('\nGET /api/vitals/ai-insights status:', resInsights.status);
    const dataInsights = await resInsights.json();
    console.log('Alerts count:', dataInsights.data?.alerts?.length);
    console.log('Top Alert:', dataInsights.data?.alerts?.[0]?.title);
    console.log('Hindi Message:', dataInsights.data?.alerts?.[0]?.messageHindi);

    // 3. GET /api/vitals/patient/:patientId (Doctor access)
    const demoPatient = await prisma.user.findFirst({ where: { email: 'patient@curalink.com' } });
    if (demoPatient) {
      const resDoctor = await fetch(`http://localhost:5000/api/vitals/patient/${demoPatient.id}`);
      console.log('\nGET /api/vitals/patient/:id status:', resDoctor.status);
      const dataDoctor = await resDoctor.json();
      console.log('Patient logs available for doctor:', dataDoctor.data?.totalLogs);
      console.log('Doctor insights trajectory:', dataDoctor.data?.insights?.overallTrajectory);
    }
  } catch (err: any) {
    console.error('API Test Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testApi();

