import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import prisma from '@/src/lib/prisma';
import { verifyToken } from '@/src/utils/jwt';

type DoctorSession = {
  user: { id: string; name: string; email: string; role: Role };
  doctor: { id: string; specialty: string };
};

function unauthorized(message: string) {
  return { response: NextResponse.json({ message }, { status: 401 }) } as const;
}

export async function requireDoctor(request: Request): Promise<{ session: DoctorSession } | { response: NextResponse }> {
  const cookieStore = await cookies();
  let token = cookieStore.get('curalink_token')?.value;
  const authorization = request.headers.get('authorization');
  if (!token && authorization?.startsWith('Bearer ')) token = authorization.slice(7);
  if (!token) return unauthorized('Unauthenticated');

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        doctorProfile: { select: { id: true, specialty: true } },
      },
    });
    if (!user) return unauthorized('Unauthenticated');
    if (user.role !== Role.DOCTOR) {
      return { response: NextResponse.json({ message: 'Doctor access required' }, { status: 403 }) };
    }
    if (!user.doctorProfile) {
      return { response: NextResponse.json({ message: 'Doctor profile not found' }, { status: 403 }) };
    }
    return { session: { user, doctor: user.doctorProfile } };
  } catch {
    return unauthorized('Invalid or expired token');
  }
}
