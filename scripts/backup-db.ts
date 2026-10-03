import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/lib/prisma';

export async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const appointments = await prisma.appointment.findMany({
    include: {
      payment: true,
      prescription: true,
      review: true,
    },
  });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true },
  });

  const doctorProfiles = await prisma.doctorProfile.findMany();

  const backupData = {
    timestamp: new Date().toISOString(),
    totalAppointments: appointments.length,
    appointments,
    usersCount: users.length,
    doctorProfilesCount: doctorProfiles.length,
  };

  const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`[Backup] Database snapshot successfully saved to ${backupPath}`);
  return backupPath;
}

if (require.main === module) {
  backupDatabase()
    .catch((err) => {
      console.error('[Backup Failed]:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
