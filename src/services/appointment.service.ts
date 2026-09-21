import prisma from '../lib/prisma';
import { BadRequestError } from '../utils/errors';

export interface CreateAppointmentInput {
  doctorId: string;
  date: string;
  time: string;
}

export class AppointmentService {
  async bookAppointment(userId: string, input: CreateAppointmentInput) {
    const { doctorId, date, time } = input;

    // Check if the user already has an appointment at this time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        userId,
        date,
        time,
      }
    });

    if (existingAppointment) {
      throw new BadRequestError('You already have an appointment scheduled at this time.');
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        doctorId,
        date,
        time,
        status: 'CONFIRMED'
      }
    });

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
