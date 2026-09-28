import { prisma } from '../src/lib/prisma';
import { doctorVerificationService } from '../src/services/doctor-verification.service';

async function main() {
  console.log('--- Step 1: Find a doctor in the database ---');
  let doctorUser = await prisma.user.findFirst({
    where: { role: 'DOCTOR' },
    include: { doctorProfile: true },
  });

  if (!doctorUser) {
    console.log('No doctor user found, searching doctor profiles...');
    const dp = await prisma.doctorProfile.findFirst({
      include: { user: true },
    });
    if (dp) {
      doctorUser = dp.user as any;
    }
  }

  if (!doctorUser) {
    console.error('No doctor found in database!');
    process.exit(1);
  }

  console.log(`Using doctor: ${doctorUser.name} (${doctorUser.id})`);

  console.log('\n--- Step 2: Doctor sets/updates practice profile fields ---');
  const testPayload = {
    name: doctorUser.name,
    specialization: 'Cardiology',
    city: 'Hisar',
    consultationFee: 850,
    consultationModes: ['VIDEO', 'IN_PERSON'],
    experienceYears: 14,
    medicalLicenseNumber: 'MCI-99881-CAR',
    bio: 'Senior Interventional Cardiologist specializing in preventive heart health and telemedicine.',
  };

  const updatedProfile = await doctorVerificationService.updateDoctorProfile(doctorUser.id, testPayload);
  console.log('Profile successfully updated in DB:');
  console.log({
    id: updatedProfile.id,
    userId: updatedProfile.userId,
    specialization: updatedProfile.specialization,
    city: updatedProfile.city,
    fee: updatedProfile.consultationFee,
    modes: updatedProfile.consultationModes,
    experience: updatedProfile.experienceYears,
  });

  console.log('\n--- Step 3: Verify GET /doctors/me profile representation ---');
  const myProfile = await doctorVerificationService.getDoctorProfile(doctorUser.id);
  console.log('Doctor self-profile loaded:', {
    specialization: myProfile?.specialization,
    city: myProfile?.city,
    fee: myProfile?.consultationFee,
    modes: myProfile?.consultationModes,
  });

  console.log('\n--- Step 4: Verify patient Find Doctor search filters ---');

  // Filter 1: By specialty Cardiology
  const cardiologyDocs = await doctorVerificationService.getVerifiedDoctors({
    specialty: 'Cardiology',
  });
  const foundBySpec = cardiologyDocs.some((d) => d.id === doctorUser!.id || d.userId === doctorUser!.id);
  console.log(`Filter [Specialty: Cardiology] -> Total: ${cardiologyDocs.length}, Found our doctor: ${foundBySpec ? '✓ YES' : '✗ NO'}`);

  // Filter 2: By City Hisar
  const hisarDocs = await doctorVerificationService.getVerifiedDoctors({
    city: 'Hisar',
  });
  const foundByCity = hisarDocs.some((d) => d.id === doctorUser!.id || d.userId === doctorUser!.id);
  console.log(`Filter [City: Hisar] -> Total: ${hisarDocs.length}, Found our doctor: ${foundByCity ? '✓ YES' : '✗ NO'}`);

  // Filter 3: By Consultation Mode IN_PERSON
  const inPersonDocs = await doctorVerificationService.getVerifiedDoctors({
    consultationMode: 'IN_PERSON',
  });
  const foundByInPerson = inPersonDocs.some((d) => d.id === doctorUser!.id || d.userId === doctorUser!.id);
  console.log(`Filter [Mode: IN_PERSON] -> Total: ${inPersonDocs.length}, Found our doctor: ${foundByInPerson ? '✓ YES' : '✗ NO'}`);

  // Filter 4: By Consultation Mode VIDEO
  const videoDocs = await doctorVerificationService.getVerifiedDoctors({
    consultationMode: 'VIDEO',
  });
  const foundByVideo = videoDocs.some((d) => d.id === doctorUser!.id || d.userId === doctorUser!.id);
  console.log(`Filter [Mode: VIDEO] -> Total: ${videoDocs.length}, Found our doctor: ${foundByVideo ? '✓ YES' : '✗ NO'}`);

  // Filter 5: Combined filter - Specialty + City + Mode
  const combinedDocs = await doctorVerificationService.getVerifiedDoctors({
    specialty: 'Cardiology',
    city: 'Hisar',
    consultationMode: 'IN_PERSON',
  });
  const foundCombined = combinedDocs.some((d) => d.id === doctorUser!.id || d.userId === doctorUser!.id);
  console.log(`Filter [Combined: Cardiology + Hisar + IN_PERSON] -> Total: ${combinedDocs.length}, Found our doctor: ${foundCombined ? '✓ YES' : '✗ NO'}`);

  if (foundBySpec && foundByCity && foundByInPerson && foundByVideo && foundCombined) {
    console.log('\n🎉 ALL FILTER CHECKS PASSED PERFECTLY! The full doctor profile setup to patient discovery loop is functional.');
  } else {
    console.error('\n❌ Some filter checks failed!');
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('Error running test:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
