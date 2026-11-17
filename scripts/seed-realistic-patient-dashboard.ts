import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getISTDateOffset(daysOffset: number): string {
  const target = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
  return target.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

async function main() {
  console.log("Cleaning up fictional test doctors & seeding realistic patient dashboard data...");

  // 1. Find fictional Dr. Gregory House
  const gregoryHouse = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { contains: "Gregory House", mode: "insensitive" } },
        { email: { startsWith: "test_doctor_" } },
      ],
    },
    include: { doctorProfile: true },
  });

  // 2. Find verified Indian specialists
  const drPriya = await prisma.user.findFirst({
    where: { email: "dr.priya.sharma@curalink.health" },
    include: { doctorProfile: true },
  });
  const drRajesh = await prisma.user.findFirst({
    where: { email: "dr.rajesh.verma@curalink.health" },
    include: { doctorProfile: true },
  });
  const drDebabrata = await prisma.user.findFirst({
    where: { name: "Dr. Debabrata Banerjee", doctorProfile: { isNot: null } },
    include: { doctorProfile: true },
  });

  if (!drPriya || !drRajesh) {
    throw new Error("Required verified Indian doctors (Dr. Priya Sharma, Dr. Rajesh Verma) not found in DB.");
  }

  // Upgrade Dr. Priya Sharma's specialty to reflect Internal Medicine & Diabetology/Primary Care cleanly
  if (drPriya.doctorProfile) {
    await prisma.doctorProfile.update({
      where: { id: drPriya.doctorProfile.id },
      data: {
        specialization: "Consultant Diabetologist & Internal Medicine",
        experienceYears: 12,
        consultationFee: 650,
      },
    });
  }

  // 3. Reassign any appointments pointing to Dr. Gregory House -> Dr. Priya Sharma, then unapprove Gregory House
  const todayIST = getISTDateOffset(0);
  const tomorrowIST = getISTDateOffset(1);
  const fourDaysAgoIST = getISTDateOffset(-4);

  // Active live window for today's confirmed video call
  const now = new Date();
  const activeStart = new Date(now.getTime() + 5 * 60 * 1000); // 5 mins from now (eligible immediately!)
  const activeEnd = new Date(activeStart.getTime() + 30 * 60 * 1000);

  if (gregoryHouse) {
    await prisma.appointment.updateMany({
      where: { doctorId: gregoryHouse.id },
      data: {
        doctorId: drPriya.id,
        date: todayIST,
        time: "10:30 AM",
        scheduledAt: activeStart,
        endTime: activeEnd,
        status: "CONFIRMED",
      },
    });

    if (gregoryHouse.doctorProfile) {
      await prisma.doctorProfile.update({
        where: { id: gregoryHouse.doctorProfile.id },
        data: { verificationStatus: "REJECTED" },
      });
    }
    console.log("Reassigned Dr. Gregory House appointments to Dr. Priya Sharma and hid test doctor from verified list.");
  }

  // 4. Find Subham's patient account (sn343555@gmail.com)
  const patient = await prisma.user.findUnique({
    where: { email: "sn343555@gmail.com" },
  });

  if (!patient) {
    console.log("Patient sn343555@gmail.com not found — skipping patient seed.");
    process.exit(0);
  }

  // Ensure patient profile details are realistic
  await prisma.user.update({
    where: { id: patient.id },
    data: {
      age: patient.age || 24,
      gender: patient.gender || "Male",
      profileCompletedAt: patient.profileCompletedAt || new Date(),
    },
  });

  // Ensure confirmed today consultation with Dr. Priya Sharma exists
  let confirmedApt = await prisma.appointment.findFirst({
    where: {
      userId: patient.id,
      doctorId: drPriya.id,
      status: "CONFIRMED",
    },
  });

  if (!confirmedApt) {
    confirmedApt = await prisma.appointment.create({
      data: {
        userId: patient.id,
        doctorId: drPriya.id,
        date: todayIST,
        time: "10:30 AM",
        scheduledAt: activeStart,
        endTime: activeEnd,
        durationMinutes: 30,
        timezone: "Asia/Kolkata",
        status: "CONFIRMED",
      },
    });
  } else {
    confirmedApt = await prisma.appointment.update({
      where: { id: confirmedApt.id },
      data: {
        date: todayIST,
        time: "10:30 AM",
        scheduledAt: activeStart,
        endTime: activeEnd,
        status: "CONFIRMED",
      },
    });
  }

  // Ensure a PENDING appointment tomorrow with Dr. Rajesh Verma exists
  const existingPending = await prisma.appointment.findFirst({
    where: {
      userId: patient.id,
      doctorId: drRajesh.id,
      status: "PENDING",
    },
  });

  if (!existingPending) {
    const tomorrowStart = new Date(`${tomorrowIST}T16:00:00+05:30`);
    await prisma.appointment.create({
      data: {
        userId: patient.id,
        doctorId: drRajesh.id,
        date: tomorrowIST,
        time: "04:00 PM",
        scheduledAt: tomorrowStart,
        endTime: new Date(tomorrowStart.getTime() + 30 * 60 * 1000),
        durationMinutes: 30,
        timezone: "Asia/Kolkata",
        status: "PENDING",
      },
    });
  }

  // Ensure a COMPLETED consultation with a real NMC E-Prescription exists
  const completedDoctor = drDebabrata || drPriya;
  let completedApt = await prisma.appointment.findFirst({
    where: {
      userId: patient.id,
      status: "COMPLETED",
    },
  });

  if (!completedApt) {
    const pastStart = new Date(`${fourDaysAgoIST}T11:00:00+05:30`);
    completedApt = await prisma.appointment.create({
      data: {
        userId: patient.id,
        doctorId: completedDoctor.id,
        date: fourDaysAgoIST,
        time: "11:00 AM",
        scheduledAt: pastStart,
        endTime: new Date(pastStart.getTime() + 30 * 60 * 1000),
        durationMinutes: 30,
        timezone: "Asia/Kolkata",
        status: "COMPLETED",
      },
    });
  }

  const existingRx = await prisma.prescription.findUnique({
    where: { appointmentId: completedApt.id },
  });

  if (!existingRx) {
    await prisma.prescription.create({
      data: {
        appointmentId: completedApt.id,
        patientId: patient.id,
        doctorId: completedApt.doctorId,
        diagnosis: "Seasonal Allergic Rhinitis & Mild Vitamin D Insufficiency (ICD-10: J30.9)",
        medications: JSON.stringify([
          {
            name: "Tab. Montair-LC (Montelukast 10mg + Levocetirizine 5mg)",
            dosage: "1 Tablet (Oral)",
            frequency: "0 - 0 - 1",
            timing: "After Dinner (Bedtime)",
            duration: "10 Days (10 Tabs)",
            instructions: "Take at night for nasal congestion & allergic symptom relief.",
          },
          {
            name: "Cap. Uprise-D3 60K (Cholecalciferol 60,000 IU)",
            dosage: "1 Softgel Capsule",
            frequency: "Once Weekly",
            timing: "After Sunday Breakfast",
            duration: "8 Weeks (8 Caps)",
            instructions: "Take with warm milk or after a full meal for optimal absorption.",
          },
          {
            name: "Nasoclear Saline Nasal Spray",
            dosage: "2 Sprays each nostril",
            frequency: "1 - 0 - 1",
            timing: "Morning & Night",
            duration: "7 Days",
            instructions: "Use gently for nasal mucosal hydration.",
          },
        ]),
        notes:
          "Patient evaluated via encrypted HD telehealth consultation. Vitals stable (BP 118/78 mmHg, SpO2 99%, HR 72 bpm). Advised steam inhalation, hydration, and allergen avoidance. Review after 2 weeks or SOS.",
      },
    });
  }

  // Seed a welcoming message on the confirmed appointment if none exists
  const existingMsgCount = await prisma.message.count({
    where: { appointmentId: confirmedApt.id },
  });

  if (existingMsgCount === 0) {
    await prisma.message.create({
      data: {
        appointmentId: confirmedApt.id,
        senderId: drPriya.id,
        receiverId: patient.id,
        content:
          "Hello Subham! Your video consultation slot for today (10:30 AM IST) is confirmed. Feel free to share any recent lab reports or BP/glucose readings here before we join.",
      },
    });
  }

  console.log("Realistic patient dashboard data seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
