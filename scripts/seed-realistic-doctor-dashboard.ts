import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function formatDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

function buildScheduledAt(dateStr: string, timeStr: string): Date {
  // Parse "10:30 AM" into IST date
  const [timePart, meridiem] = timeStr.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return new Date(`${dateStr}T${hh}:${mm}:00+05:30`);
}

async function main() {
  console.log("🧹 Cleaning up ugly smoke_patient_* test records...");

  const deletedSmoke = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { startsWith: "smoke_patient_" } },
        { name: { contains: "Smoke Test" } },
      ],
    },
  });
  console.log(`✅ Removed ${deletedSmoke.count} smoke test patient accounts (and cascaded their appointments).`);

  // Find target doctors (Subham Nayak accounts so whichever login is used has real data)
  const targetDoctors = await prisma.doctorProfile.findMany({
    where: {
      user: {
        email: {
          in: ["sn343555@gmail.com", "2401301021@geetauniversity.edu.in"],
        },
      },
    },
    include: { user: true },
  });

  if (targetDoctors.length === 0) {
    console.log("⚠️ No target doctor profiles found. Checking all doctors...");
    const allDocs = await prisma.doctorProfile.findMany({ include: { user: true }, take: 2 });
    targetDoctors.push(...allDocs);
  }

  console.log(`👨‍⚕️ Seeding realistic clinical practice data for ${targetDoctors.length} doctor profile(s):`);
  targetDoctors.forEach((d) => console.log(`   - ${d.user.name} (${d.user.email})`));

  // Ensure doctor profiles have crisp professional metadata
  for (const doc of targetDoctors) {
    await prisma.doctorProfile.update({
      where: { id: doc.id },
      data: {
        specialization: doc.specialization || "General Medicine & Cardiology",
        city: doc.city || "Hisar",
        consultationFee: doc.consultationFee || 500,
        consultationModes: ["VIDEO", "IN_PERSON"],
        experienceYears: doc.experienceYears || 8,
        verificationStatus: "APPROVED",
        bio:
          doc.bio ||
          "Senior Consultant in Internal Medicine & Preventive Cardiology. Specializing in chronic hypertension, diabetes management, and acute primary care via encrypted telehealth.",
      },
    });
  }

  const passwordHash = await bcrypt.hash("Patient@123", 10);

  const realisticPatients = [
    {
      name: "Aarav Sharma",
      email: "aarav.sharma@curalink.in",
      phone: "+91 98112 45678",
      age: 38,
      gender: "Male",
      vitals: [
        { daysAgo: 0, sys: 134, dia: 86, glucose: 148, type: "FASTING", hr: 76, spo2: 98, temp: 98.4, weight: 78.2, notes: "Morning fasting reading before consult" },
        { daysAgo: 7, sys: 138, dia: 88, glucose: 156, type: "FASTING", hr: 78, spo2: 98, temp: 98.6, weight: 78.8, notes: "Mild work stress" },
        { daysAgo: 15, sys: 142, dia: 90, glucose: 164, type: "POST_PRANDIAL", hr: 82, spo2: 97, temp: 98.5, weight: 79.4, notes: "Baseline HbA1c review" },
      ],
    },
    {
      name: "Vikram Malhotra",
      email: "vikram.malhotra@curalink.in",
      phone: "+91 98118 90234",
      age: 61,
      gender: "Male",
      vitals: [
        { daysAgo: 0, sys: 146, dia: 92, glucose: 118, type: "FASTING", hr: 84, spo2: 96, temp: 98.2, weight: 82.0, notes: "Occasional chest tightness on stairs" },
        { daysAgo: 5, sys: 148, dia: 94, glucose: 122, type: "FASTING", hr: 86, spo2: 97, temp: 98.4, weight: 82.3, notes: "Post-angioplasty check" },
        { daysAgo: 14, sys: 140, dia: 88, glucose: 115, type: "FASTING", hr: 79, spo2: 98, temp: 98.4, weight: 82.5, notes: "Stable on Telma 40" },
      ],
    },
    {
      name: "Sunita Verma",
      email: "sunita.verma@curalink.in",
      phone: "+91 98103 78912",
      age: 54,
      gender: "Female",
      vitals: [
        { daysAgo: 1, sys: 136, dia: 84, glucose: 132, type: "RANDOM", hr: 74, spo2: 98, temp: 98.5, weight: 67.5, notes: "Mild morning headache" },
        { daysAgo: 10, sys: 132, dia: 82, glucose: 128, type: "FASTING", hr: 72, spo2: 99, temp: 98.4, weight: 68.0, notes: "Routine check" },
      ],
    },
    {
      name: "Rohan Mehra",
      email: "rohan.mehra@curalink.in",
      phone: "+91 99104 33219",
      age: 29,
      gender: "Male",
      vitals: [
        { daysAgo: 0, sys: 118, dia: 76, glucose: 94, type: "RANDOM", hr: 92, spo2: 98, temp: 100.8, weight: 71.0, notes: "Fever since last night with sore throat" },
      ],
    },
    {
      name: "Ananya Deshmukh",
      email: "ananya.deshmukh@curalink.in",
      phone: "+91 97115 62890",
      age: 34,
      gender: "Female",
      vitals: [
        { daysAgo: 2, sys: 116, dia: 74, glucose: 98, type: "FASTING", hr: 68, spo2: 99, temp: 98.3, weight: 61.2, notes: "TSH follow-up, energy improving" },
        { daysAgo: 20, sys: 114, dia: 72, glucose: 96, type: "FASTING", hr: 66, spo2: 99, temp: 98.2, weight: 62.0, notes: "Fatigue reported" },
      ],
    },
    {
      name: "Pooja Patel",
      email: "pooja.patel@curalink.in",
      phone: "+91 98712 55410",
      age: 42,
      gender: "Female",
      vitals: [
        { daysAgo: 4, sys: 122, dia: 78, glucose: 104, type: "FASTING", hr: 75, spo2: 99, temp: 98.6, weight: 64.0, notes: "Migraine episodes reduced to 1/week" },
      ],
    },
  ];

  const createdPatients: Record<string, any> = {};

  for (const p of realisticPatients) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {
        name: p.name,
        phone: p.phone,
        phoneVerified: true,
        emailVerified: true,
        age: p.age,
        gender: p.gender,
        profileCompletedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      create: {
        name: p.name,
        email: p.email,
        passwordHash,
        role: "PATIENT",
        phone: p.phone,
        phoneVerified: true,
        emailVerified: true,
        emailVerifiedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        age: p.age,
        gender: p.gender,
        profileCompletedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    });
    createdPatients[p.email] = user;

    // Seed vitals if user doesn't have recent logs
    const existingVitals = await prisma.vitalLog.count({ where: { userId: user.id } });
    if (existingVitals === 0) {
      for (const v of p.vitals) {
        await prisma.vitalLog.create({
          data: {
            userId: user.id,
            systolicBp: v.sys,
            diastolicBp: v.dia,
            bloodGlucose: v.glucose,
            glucoseType: v.type,
            heartRate: v.hr,
            spO2: v.spo2,
            temperature: v.temp,
            weight: v.weight,
            notes: v.notes,
            recordedAt: new Date(Date.now() - v.daysAgo * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  const today = formatDateOffset(0);
  const tomorrow = formatDateOffset(1);
  const twoDaysAgo = formatDateOffset(-2);
  const fourDaysAgo = formatDateOffset(-4);
  const sevenDaysAgo = formatDateOffset(-7);

  for (const doc of targetDoctors) {
    // Check if realistic appointments already exist for this doctor today
    const existingToday = await prisma.appointment.count({
      where: {
        doctorId: doc.userId,
        date: today,
      },
    });

    if (existingToday > 0) {
      console.log(`ℹ️ Doctor ${doc.user.email} already has ${existingToday} appointments for today (${today}). Skipping duplicate appointment seed.`);
      continue;
    }

    const scheduleBlueprint = [
      {
        patientEmail: "aarav.sharma@curalink.in",
        date: today,
        time: "10:30 AM",
        status: "CONFIRMED",
        fee: doc.consultationFee || 500,
        paymentStatus: "SUCCESS",
        prescription: null,
        review: null,
      },
      {
        patientEmail: "vikram.malhotra@curalink.in",
        date: today,
        time: "11:15 AM",
        status: "CONFIRMED",
        fee: doc.consultationFee || 500,
        paymentStatus: "SUCCESS",
        prescription: null,
        review: null,
      },
      {
        patientEmail: "sunita.verma@curalink.in",
        date: today,
        time: "02:30 PM",
        status: "PENDING",
        fee: doc.consultationFee || 500,
        paymentStatus: "SUCCESS",
        prescription: null,
        review: null,
      },
      {
        patientEmail: "rohan.mehra@curalink.in",
        date: tomorrow,
        time: "10:00 AM",
        status: "PENDING",
        fee: doc.consultationFee || 500,
        paymentStatus: "SUCCESS",
        prescription: null,
        review: null,
      },
      {
        patientEmail: "ananya.deshmukh@curalink.in",
        date: twoDaysAgo,
        time: "11:00 AM",
        status: "COMPLETED",
        fee: doc.consultationFee || 500,
        paymentStatus: "SUCCESS",
        prescription: {
          diagnosis: "Primary Hypothyroidism - TSH Follow-up (ICD-10: E03.9)",
          medications: [
            { name: "Tab. Thyronorm 50mcg", dosage: "50 mcg", frequency: "1-0-0 (Empty Stomach)", duration: "60 days", instructions: "Take 45 mins before breakfast daily" },
            { name: "Cap. Uprise-D3 60K", dosage: "60,000 IU", frequency: "Once weekly", duration: "8 weeks", instructions: "Take with warm milk after dinner" },
          ],
          notes: "Repeat Free T3, T4, and TSH panel after 8 weeks. Maintain balanced iodine intake.",
        },
        review: {
          rating: 5,
          comment: "Very thorough explanation of my thyroid levels and adjusted dosage smoothly. Felt genuinely heard.",
        },
      },
      {
        patientEmail: "pooja.patel@curalink.in",
        date: fourDaysAgo,
        time: "04:00 PM",
        status: "COMPLETED",
        fee: doc.consultationFee || 500,
        paymentStatus: "SUCCESS",
        prescription: {
          diagnosis: "Migraine without Aura - Prophylaxis & Acute Care (ICD-10: G43.0)",
          medications: [
            { name: "Tab. Sibelium 10", dosage: "10 mg", frequency: "0-0-1 (Bedtime)", duration: "30 days", instructions: "Take at night for prevention" },
            { name: "Tab. Naprosyn-D 500", dosage: "500 mg", frequency: "SOS (At headache onset)", duration: "As needed", instructions: "Take after food only during acute attack" },
          ],
          notes: "Avoid screen glare after 10 PM, hydrate 3L/day, and maintain regular sleep schedule.",
        },
        review: {
          rating: 5,
          comment: "My migraine frequency dropped dramatically within a week. Instant digital prescription was super convenient.",
        },
      },
      {
        patientEmail: "vikram.malhotra@curalink.in",
        date: sevenDaysAgo,
        time: "09:30 AM",
        status: "COMPLETED",
        fee: doc.consultationFee || 500,
        paymentStatus: "SUCCESS",
        prescription: {
          diagnosis: "Essential Hypertension & Post-Angioplasty Cardiac Care (ICD-10: I10 / I25.1)",
          medications: [
            { name: "Tab. Telma 40", dosage: "40 mg", frequency: "1-0-0 (Morning)", duration: "30 days", instructions: "Monitor home BP every morning" },
            { name: "Tab. Ecosprin AV 75/20", dosage: "75mg / 20mg", frequency: "0-0-1 (After Dinner)", duration: "30 days", instructions: "Do not skip daily cardiac maintenance" },
            { name: "Tab. Clopilet 75", dosage: "75 mg", frequency: "0-1-0 (After Lunch)", duration: "30 days", instructions: "Antiplatelet therapy" },
          ],
          notes: "Strict low-salt DASH diet (<5g/day). Immediate ER visit if persistent substernal chest pain.",
        },
        review: {
          rating: 5,
          comment: "Saved me a 2-hour hospital commute. Doctor reviewed my ECG and BP chart in detail.",
        },
      },
    ];

    for (const item of scheduleBlueprint) {
      const patient = createdPatients[item.patientEmail];
      if (!patient) continue;

      const scheduledAt = buildScheduledAt(item.date, item.time);
      const endTime = new Date(scheduledAt.getTime() + 30 * 60 * 1000);
      const shortCode = crypto.randomBytes(3).toString("hex");

      const appt = await prisma.appointment.create({
        data: {
          userId: patient.id,
          doctorId: doc.userId,
          date: item.date,
          time: item.time,
          scheduledAt,
          endTime,
          durationMinutes: 30,
          timezone: "Asia/Kolkata",
          status: item.status,
          roomName: `curalink-consult-${shortCode}`,
          roomUrl: `/consultation/pending`,
        },
      });

      // Update roomUrl with real ID
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { roomUrl: `/consultation/${appt.id}` },
      });

      // Create Payment record
      await prisma.payment.create({
        data: {
          appointmentId: appt.id,
          userId: patient.id,
          amount: item.fee,
          currency: "INR",
          status: item.paymentStatus,
          razorpayOrderId: `order_cl_${shortCode}`,
          razorpayPaymentId: `pay_cl_${shortCode}`,
        },
      });

      // Create Prescription if present
      if (item.prescription) {
        await prisma.prescription.create({
          data: {
            id: `rx_${Date.now()}_${shortCode}`,
            appointmentId: appt.id,
            patientId: patient.id,
            doctorId: doc.userId,
            diagnosis: item.prescription.diagnosis,
            medications: JSON.stringify(item.prescription.medications),
            notes: item.prescription.notes,
          },
        });
      }

      // Create Review if present
      if (item.review) {
        await prisma.review.create({
          data: {
            appointmentId: appt.id,
            doctorId: doc.userId,
            patientId: patient.id,
            rating: item.review.rating,
            comment: item.review.comment,
          },
        });
      }
    }
    console.log(`✅ Seeded 7 realistic appointments, payments, prescriptions & reviews for ${doc.user.email}`);
  }

  console.log("🎉 Realistic clinical data seed completed successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
