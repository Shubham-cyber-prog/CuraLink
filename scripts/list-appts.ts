import prisma from '../src/lib/prisma';

async function listAppts() {
  const appts = await prisma.appointment.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      doctor: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n========================================`);
  console.log(`TOTAL APPOINTMENTS IN DB: ${appts.length}`);
  console.log(`========================================`);
  for (const a of appts) {
    console.log(`ID:        ${a.id}`);
    console.log(`Patient:   ${a.user.name} (${a.user.email}) [ID: ${a.user.id}]`);
    console.log(`Doctor:    ${a.doctor.user.name} (${a.doctor.user.email}) [User ID: ${a.doctor.user.id}, Profile ID: ${a.doctor.id}]`);
    console.log(`DoctorId field on Appointment: ${a.doctorId}`);
    console.log(`Date/Time: ${a.date} at ${a.time}`);
    console.log(`Status:    ${a.status}`);
    console.log(`Created:   ${a.createdAt}`);
    console.log(`----------------------------------------`);
  }
}

listAppts()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
