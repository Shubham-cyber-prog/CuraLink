import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireDoctor } from '@/app/api/_lib/auth';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const result = await requireDoctor(request);
  if ('response' in result) return result.response;
  const { id } = await context.params;

  const updated = await prisma.appointment.updateMany({
    where: {
      id,
      doctorId: result.session.doctor.id,
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
    data: { status: 'COMPLETED' },
  });
  if (updated.count === 0) {
    return NextResponse.json({ message: 'Appointment not found or cannot be completed' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Appointment completed' });
}
