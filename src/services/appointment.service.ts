import prisma from '../lib/prisma';
import { BadRequestError } from '../utils/errors';
import { invalidateDoctorsCache } from '../lib/cache/doctors.cache';

export interface CreateAppointmentInput {
  doctorId: string;
  date: string;
  time: string;
}

export class AppointmentService {
  async bookAppointment(userId: string, input: CreateAppointmentInput) {
    const { doctorId, date, time } = input;

    // Prevent doctor booking themselves
    if (userId === doctorId) {
      throw new BadRequestError('Doctors cannot book an appointment with themselves.');
    }

    // Check for past date
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      throw new BadRequestError('Cannot book an appointment for a past date.');
    }

    // Verify doctor exists and is verified
    const doctorProfile = await prisma.doctorProfile.findFirst({
      where: {
        OR: [{ userId: doctorId }, { id: doctorId }],
      },
    });

    if (!doctorProfile) {
      throw new BadRequestError('Doctor not found.');
    }

    if (doctorProfile.verificationStatus !== 'APPROVED') {
      throw new BadRequestError('This doctor is pending administrative verification and cannot accept bookings.');
    }

    const resolvedDoctorId = doctorProfile.userId;

    if (userId === resolvedDoctorId) {
      throw new BadRequestError('Doctors cannot book an appointment with themselves.');
    }

    // Atomic transaction for concurrency safety
    const appointment = await prisma.$transaction(async (tx) => {
      // Check if doctor is already booked at this date and time
      const doctorConflict = await tx.appointment.findFirst({
        where: {
          doctorId: resolvedDoctorId,
          date,
          time,
          status: { not: 'CANCELLED' },
        },
      });

      if (doctorConflict) {
        throw new BadRequestError('This time slot is already booked with this doctor. Please select another slot.');
      }

      // Check if the user already has an appointment at this time
      const userConflict = await tx.appointment.findFirst({
        where: {
          userId,
          date,
          time,
          status: { not: 'CANCELLED' },
        },
      });

      if (userConflict) {
        throw new BadRequestError('You already have an appointment scheduled at this time.');
      }

      const created = await tx.appointment.create({
        data: {
          userId,
          doctorId: resolvedDoctorId,
          date,
          time,
          status: 'PENDING',
        },
      });

      return created;
    });

    invalidateDoctorsCache();

    // Asynchronously dispatch booking confirmation emails to patient and doctor
    try {
      const { emailService } = await import('./email/email.service');
      emailService.sendAppointmentBookedEmails(appointment.id).catch((err) => {
        console.error('[AppointmentService] Failed to dispatch booking emails:', err?.message || err);
      });
    } catch (err) {
      console.error('[AppointmentService] Error importing email service:', err);
    }

    return appointment;
  }

  async getMyAppointments(userId: string) {
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [{ userId }, { doctorId: userId }],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        doctor: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        payment: {
          select: { status: true, amount: true },
        },
        prescription: true,
        review: true,
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });

    return appointments.map((apt) => ({
      ...apt,
      doctor: apt.doctor
        ? {
            id: apt.doctor.userId,
            profileId: apt.doctor.id,
            name: apt.doctor.user?.name || 'Dr. Medical Specialist',
            specialty: apt.doctor.specialization,
            specialization: apt.doctor.specialization,
            experienceYears: apt.doctor.experienceYears,
            consultationFee: apt.doctor.consultationFee,
          }
        : null,
      patient: apt.user
        ? {
            id: apt.user.id,
            name: apt.user.name,
            email: apt.user.email,
          }
        : null,
    }));
  }
}

export const appointmentService = new AppointmentService();
