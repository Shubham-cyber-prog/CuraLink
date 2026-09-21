import { videoService } from '../src/services/video.service';
import prisma from '../src/lib/prisma';

async function test() {
  const appt = await prisma.appointment.findFirst();
  if (!appt) {
    console.log('No appointment found in database');
    return;
  }
  console.log('Testing with appointment ID:', appt.id);
  const room = await videoService.createRoom(appt.id);
  console.log('Room created successfully:', room);
  const token = await videoService.generateMeetingToken(room.roomName, appt.userId, false, 'Test Patient');
  console.log('Meeting token generated! Token length:', token.token.length);
}

test()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error during Daily test:', err);
    process.exit(1);
  });
