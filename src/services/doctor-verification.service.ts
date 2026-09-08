import { prisma } from '../lib/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { SubmitVerificationInput } from '../validators/doctor.validator';

export class DoctorVerificationService {
  /**
   * Submit medical license credentials for verification
   */
  async submitVerification(userId: string, input: SubmitVerificationInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'DOCTOR') {
      throw new BadRequestError('Only users registered with DOCTOR role can submit medical verification');
    }

    const doctorProfile = await prisma.doctorProfile.upsert({
      where: { userId },
      create: {
        userId,
        medicalLicenseNumber: input.medicalLicenseNumber,
        specialization: input.specialization,
        experienceYears: input.experienceYears,
        consultationFee: input.consultationFee,
        bio: input.bio,
        verificationStatus: 'PENDING',
      },
      update: {
        medicalLicenseNumber: input.medicalLicenseNumber,
        specialization: input.specialization,
        experienceYears: input.experienceYears,
        consultationFee: input.consultationFee,
        bio: input.bio,
        verificationStatus: 'PENDING',
      },
    });

    return doctorProfile;
  }

  /**
   * Admin approves or rejects doctor verification
   */
  async setVerificationStatus(doctorId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!profile) {
      throw new NotFoundError('Doctor profile not found');
    }

    const updated = await prisma.doctorProfile.update({
      where: { userId: doctorId },
      data: {
        verificationStatus: status,
        verifiedAt: status === 'APPROVED' ? new Date() : null,
      },
    });

    return updated;
  }

  /**
   * Get public verified doctors
   */
  async getVerifiedDoctors() {
    const doctors = await prisma.doctorProfile.findMany({
      where: { verificationStatus: 'APPROVED' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return doctors;
  }

  /**
   * Get doctor profile by user ID
   */
  async getDoctorProfile(userId: string) {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return profile;
  }
}

export const doctorVerificationService = new DoctorVerificationService();
