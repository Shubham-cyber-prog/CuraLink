import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/src/lib/prisma';
import { verifyToken } from '@/src/utils/jwt';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('curalink_token')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { role: true },
    });
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ message: 'Patient access required' }, { status: 403 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: payload.id },
      orderBy: { createdAt: 'desc' },
    });

    const upcomingCount = appointments.filter(
      (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
    ).length;
    const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

    return NextResponse.json({
      appointments: appointments.map((a) => ({
        id: a.id,
        doctorName: a.doctorName,
        specialty: a.doctorSpecialty,
        date: a.appointmentDate,
        time: a.appointmentTime,
        type: a.consultationType === 'VIDEO' ? 'Video' : 'In-Person',
        status: a.status,
      })),
      stats: {
        upcomingCount,
        completedCount,
        prescriptionsCount: 2,
      },
    });
  } catch {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}
