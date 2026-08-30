import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireDoctor } from '@/app/api/_lib/auth';

export async function GET(request: Request) {
  const result = await requireDoctor(request);
  if ('response' in result) return result.response;

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: result.session.doctor.id },
    include: { patient: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    appointments: appointments.map((appointment) => ({
      id: appointment.id,
      patientName: appointment.patient.name,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      type: appointment.consultationType === 'VIDEO' ? 'Video' : 'In-Person',
      status: appointment.status,
    })),
  });
}
