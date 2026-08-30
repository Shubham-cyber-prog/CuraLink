import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireDoctor } from '@/app/api/_lib/auth';

function formatAppointment(appointment: {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: 'VIDEO' | 'IN_PERSON';
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  patient: { id: string; name: string };
}) {
  return {
    id: appointment.id,
    patientId: appointment.patient.id,
    patientName: appointment.patient.name,
    date: appointment.appointmentDate,
    time: appointment.appointmentTime,
    type: appointment.consultationType === 'VIDEO' ? 'Video' : 'In-Person',
    status: appointment.status,
  };
}

export async function GET(request: Request) {
  const result = await requireDoctor(request);
  if ('response' in result) return result.response;

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: result.session.doctor.id },
    include: { patient: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const today = appointments.filter((appointment) => appointment.appointmentDate === 'Today');
  const activeAppointments = appointments.filter((appointment) => appointment.status !== 'CANCELLED');
  const weekAppointments = appointments.filter((appointment) =>
    appointment.appointmentDate === 'Today' || appointment.appointmentDate === 'Tomorrow',
  );

  return NextResponse.json({
    appointments: today.map(formatAppointment),
    stats: {
      todayCount: today.length,
      patientCount: new Set(activeAppointments.map((appointment) => appointment.patientId)).size,
      weekCount: weekAppointments.length,
    },
  });
}
