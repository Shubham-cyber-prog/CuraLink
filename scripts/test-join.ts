import prisma from '../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

async function testJoinRoute() {
  const appt = await prisma.appointment.findFirst({
    include: { user: true },
  });

  if (!appt) {
    console.error('No appointment found');
    process.exit(1);
  }

  // Create JWT token for the patient
  const token = jwt.sign(
    { id: appt.userId, email: appt.user.email, role: 'PATIENT' },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  console.log('Testing GET http://localhost:5000/api/appointments/' + appt.id + '/join');

  const res = await fetch(`http://localhost:5000/api/appointments/${appt.id}/join`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: `accessToken=${token}`,
    },
  });

  console.log('Response status:', res.status);
  const data = await res.json();
  console.log('Response data:', JSON.stringify(data, null, 2));

  if (res.status === 200 && data.data?.roomUrl && data.data?.roomName) {
    console.log('✅ Jitsi join endpoint passed! Room Name:', data.data.roomName, 'URL:', data.data.roomUrl);
  } else {
    console.error('❌ Failed join endpoint test');
    process.exit(1);
  }
}

testJoinRoute().catch((err) => {
  console.error(err);
  process.exit(1);
});
