import { prisma } from '../lib/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { SubmitVerificationInput } from '../validators/doctor.validator';
import { doctorsCache, invalidateDoctorsCache } from '../lib/cache/doctors.cache';

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
        consultationModes: input.consultationModes || ['VIDEO'],
        city: input.city ? input.city.trim() : null,
        bio: input.bio,
        verificationStatus: 'PENDING',
      },
      update: {
        medicalLicenseNumber: input.medicalLicenseNumber,
        specialization: input.specialization,
        experienceYears: input.experienceYears,
        consultationFee: input.consultationFee,
        ...(input.consultationModes ? { consultationModes: input.consultationModes } : {}),
        city: input.city !== undefined ? (input.city ? input.city.trim() : null) : undefined,
        bio: input.bio,
        verificationStatus: 'PENDING',
      },
    });

    invalidateDoctorsCache();
    return doctorProfile;
  }

  /**
   * Admin approves or rejects doctor verification
   */
  async setVerificationStatus(doctorId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    let profile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    }).catch(() => null);

    if (!profile) {
      profile = await prisma.doctorProfile.findFirst({
        where: {
          OR: [{ userId: doctorId }, { id: doctorId }],
        },
      });
    }

    if (!profile) {
      throw new NotFoundError('Doctor profile not found');
    }

    const updated = await prisma.doctorProfile.update({
      where: { id: profile.id },
      data: {
        verificationStatus: status,
        verifiedAt: status === 'APPROVED' ? new Date() : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (updated.user) {
      const { emailService } = await import('./email/email.service');
      if (status === 'APPROVED') {
        emailService.sendDoctorApprovedEmail(updated.user).catch((err) =>
          console.error('[DoctorVerificationService] Failed to send approval email:', err?.message || err)
        );
      } else if (status === 'REJECTED') {
        emailService.sendDoctorRejectedEmail(updated.user).catch((err) =>
          console.error('[DoctorVerificationService] Failed to send rejection email:', err?.message || err)
        );
      }
    }

    invalidateDoctorsCache();
    return updated;
  }

  /**
   * Format doctor profile into canonical frontend-compatible doctor object
   */
  private formatDoctor(doc: any) {
    const reviews = (doc.user?.reviewsReceived || []).map((r: any) => ({
      id: r.id,
      nameInitial: r.patient?.name ? `${r.patient.name.charAt(0)}.` : 'P.',
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
    }));

    const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(2)) : null;
    const reviewCount = reviews.length;

    // Generate valid YYYY-MM-DD availability slots for the next 5 days
    const now = new Date();
    const availabilitySlots = [];
    const defaultTimes = ['09:00 AM', '10:30 AM', '02:00 PM', '04:15 PM'];

    for (let i = 0; i < 5; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      availabilitySlots.push({
        date: dateStr,
        slots: defaultTimes,
      });
    }

    return {
      id: doc.userId, // Canonical ID is the doctor User ID (for booking appointments)
      profileId: doc.id,
      userId: doc.userId,
      name: doc.user?.name
        ? doc.user.name.startsWith('Dr.')
          ? doc.user.name
          : `Dr. ${doc.user.name}`
        : 'Dr. Medical Specialist',
      email: doc.user?.email,
      medicalLicenseNumber: doc.medicalLicenseNumber,
      specialization: doc.specialization,
      specialty: doc.specialization,
      experienceYears: doc.experienceYears,
      experience: `${doc.experienceYears}+ years experience`,
      consultationFee: doc.consultationFee ?? 500,
      city: doc.city || null,
      location: doc.city ? `${doc.city}, India` : 'CuraLink Telehealth',
      verificationStatus: doc.verificationStatus,
      bio: doc.bio || null,
      rating: avgRating,
      reviewCount,
      consultationModes: Array.isArray(doc.consultationModes) && doc.consultationModes.length > 0
        ? doc.consultationModes
        : ['VIDEO'],
      videoConsultation: !doc.consultationModes || doc.consultationModes.length === 0
        ? true
        : doc.consultationModes.includes('VIDEO'),
      inPersonConsultation: Array.isArray(doc.consultationModes)
        ? doc.consultationModes.includes('IN_PERSON')
        : false,
      availability: 'today' as const,
      nextAvailableDate: availabilitySlots[0]?.date || 'Today',
      nextAvailableTime: '10:30 AM',
      qualifications: [
        `Medical License: ${doc.medicalLicenseNumber}`,
        `Board Certified in ${doc.specialization}`,
        `${doc.experienceYears}+ Years Clinical Practice`,
      ],
      availabilitySlots,
      reviews,
    };
  }

  /**
   * Get public verified doctors with optional city, specialty, and pagination filter
   * Protected with Singleflight promise coalescing to eliminate cache stampedes.
   */
  async getVerifiedDoctors(filters?: { city?: string; specialty?: string; consultationMode?: string; page?: number; limit?: number }) {
    const cleanCity = filters?.city?.trim().toLowerCase() || 'all';
    const cleanSpec = filters?.specialty?.trim().toLowerCase() || 'all';
    const cleanMode = filters?.consultationMode?.trim().toUpperCase() || 'all';
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(100, Math.max(1, filters?.limit || 50));
    const cacheKey = `verified:${cleanCity}:${cleanSpec}:${cleanMode}:${page}:${limit}`;

    return doctorsCache.getOrFetch<any[]>(cacheKey, async () => {
      const where: any = { verificationStatus: 'APPROVED' };

      if (cleanCity !== 'all') {
        where.city = { contains: filters!.city!.trim(), mode: 'insensitive' };
      }
      if (cleanSpec !== 'all') {
        where.specialization = { contains: filters!.specialty!.trim(), mode: 'insensitive' };
      }
      if (cleanMode !== 'all') {
        // Filter doctors that have this mode in their consultationModes array
        where.consultationModes = { has: cleanMode };
      }

      const doctors = await prisma.doctorProfile.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              reviewsReceived: {
                select: {
                  id: true,
                  rating: true,
                  comment: true,
                  createdAt: true,
                  patient: {
                    select: { name: true },
                  },
                },
                take: 5,
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
        orderBy: [
          { experienceYears: 'desc' },
          { id: 'asc' }, // Deterministic secondary sorting for reliable pagination
        ],
      });

      return doctors.map((doc) => this.formatDoctor(doc));
    }, 60 * 1000);
  }

  /**
   * Update doctor's own profile (city, bio, consultationFee, etc.)
   */
  async updateDoctorProfile(userId: string, data: {
    name?: string;
    phone?: string;
    city?: string | null;
    bio?: string | null;
    consultationFee?: number;
    specialization?: string;
    consultationModes?: string[];
    experienceYears?: number;
    medicalLicenseNumber?: string;
  }) {
    const updateData: any = {};
    if (data.city !== undefined) updateData.city = data.city ? data.city.trim() : null;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.consultationFee !== undefined) updateData.consultationFee = Number(data.consultationFee);
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.consultationModes !== undefined) {
      // Validate modes
      const validModes = ['VIDEO', 'IN_PERSON'];
      updateData.consultationModes = data.consultationModes.filter(m => validModes.includes(m));
      if (updateData.consultationModes.length === 0) updateData.consultationModes = ['VIDEO'];
    }
    if (data.experienceYears !== undefined) updateData.experienceYears = Number(data.experienceYears);
    if (data.medicalLicenseNumber !== undefined) updateData.medicalLicenseNumber = data.medicalLicenseNumber.trim();

    // If name or phone is provided, update user record as well
    if (data.name || data.phone !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.name ? { name: data.name.trim() } : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
        },
      });
    }

    const profile = await prisma.doctorProfile.upsert({
      where: { userId },
      create: {
        userId,
        medicalLicenseNumber: data.medicalLicenseNumber?.trim() || 'PENDING',
        specialization: data.specialization || 'General Practice',
        consultationFee: data.consultationFee ? Number(data.consultationFee) : 500,
        city: data.city ? data.city.trim() : null,
        bio: data.bio || null,
        verificationStatus: 'PENDING',
        consultationModes: updateData.consultationModes || ['VIDEO'],
        experienceYears: data.experienceYears !== undefined ? Number(data.experienceYears) : 0,
      },
      update: {
        ...updateData,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    invalidateDoctorsCache();
    return profile;
  }


  /**
   * Get doctor profile by User ID or DoctorProfile ID (public lookup)
   */
  async getDoctorById(id: string) {
    const doctor = await prisma.doctorProfile.findFirst({
      where: {
        OR: [
          { userId: id },
          { id },
        ],
        verificationStatus: 'APPROVED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            reviewsReceived: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                patient: {
                  select: { name: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!doctor) return null;
    return this.formatDoctor(doctor);
  }

  /**
   * Get doctor profile by user ID.
   * Returns the profile as-is — NEVER auto-creates or auto-approves.
   * Doctors must submit verification via submitVerification() and be
   * approved by an admin via setVerificationStatus().
   */
  async getDoctorProfile(userId: string) {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Return null if the doctor has not submitted verification yet.
    // The frontend should detect this and show the verification submission form.
    return profile;
  }
}

export const doctorVerificationService = new DoctorVerificationService();
