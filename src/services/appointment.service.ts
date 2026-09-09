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
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    if (!prisma.doctorProfile?.findMany) {
      return appointments;
    }

    // Lookup doctors for all appointments
    const doctorIds = [...new Set(appointments.map((a) => a.doctorId))];
    const doctorProfiles = await prisma.doctorProfile.findMany({
      where: {
        OR: [
          { userId: { in: doctorIds } },
          { id: { in: doctorIds } },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const doctorMap = new Map<string, any>();
    for (const dp of doctorProfiles) {
      const docData = {
        id: dp.userId,
        name: dp.user?.name || 'Dr. Medical Specialist',
        specialty: dp.specialization,
        specialization: dp.specialization,
        experienceYears: dp.experienceYears,
        consultationFee: dp.consultationFee,
      };
      doctorMap.set(dp.userId, docData);
      doctorMap.set(dp.id, docData);
    }

    return appointments.map((apt) => ({
      ...apt,
      doctor: doctorMap.get(apt.doctorId) || null,
    }));
  }
}

export const appointmentService = new AppointmentService();
