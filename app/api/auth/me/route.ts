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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        doctorProfile: {
          select: {
            id: true,
            specialty: true,
            bio: true,
            qualifications: true,
            yearsExperience: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        ...user,
        doctorProfile: user.role === 'DOCTOR' ? user.doctorProfile : undefined,
      },
    });
  } catch {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}
