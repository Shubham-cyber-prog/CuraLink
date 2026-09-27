require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const userCount = await prisma.user.count();
    const doctorCount = await prisma.doctorProfile.count();
    const apptCount = await prisma.appointment.count();
    const vitalsCount = await prisma.vitalLog.count();
    console.log('Database connected successfully!');
    console.log({ userCount, doctorCount, apptCount, vitalsCount });
    
    // Check some sample users/doctors
    const doctors = await prisma.doctorProfile.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });
    console.log('Doctors in DB:', doctors.map(d => ({
      userId: d.userId,
      name: d.user?.name,
      email: d.user?.email,
      specialization: d.specialization,
      city: d.city,
      status: d.verificationStatus
    })));
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
