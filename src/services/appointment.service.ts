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
      where: { userId },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
    return appointments;
  }
}

export const appointmentService = new AppointmentService();
