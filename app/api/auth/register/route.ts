import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/src/lib/prisma';
import { generateToken } from '@/src/utils/jwt';
import { DOCTOR_SPECIALTIES } from '@/lib/specialties';

const registerSchema = z.discriminatedUnion('role', [z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.literal('PATIENT').default('PATIENT'),
}), z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.literal('DOCTOR'),
  specialty: z.enum(DOCTOR_SPECIALTIES),
  yearsExperience: z.coerce.number().int().min(0).max(80),
})]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Invalid input data';
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: parsed.data.role,
        },
      });

      if (parsed.data.role === 'DOCTOR') {
        await tx.doctor.create({
          data: {
            userId: createdUser.id,
            name: createdUser.name.startsWith('Dr.') ? createdUser.name : `Dr. ${createdUser.name}`,
            specialty: parsed.data.specialty,
            yearsExperience: parsed.data.yearsExperience,
            bio: 'New CuraLink doctor profile.',
            qualifications: [],
          },
        });
      }

      return createdUser;
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('curalink_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
