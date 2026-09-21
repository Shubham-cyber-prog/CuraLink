import crypto from 'crypto';
import prisma from '../lib/prisma';
import { NotFoundError } from '../utils/errors';

export interface VideoRoomResult {
  roomName: string;
  roomUrl: string;
}

export class VideoService {
  private readonly jitsiDomain = 'meet.jit.si';

  /**
   * Generates a unique, collision-resistant room name for Jitsi Meet,
   * stores it on the Appointment record in the database, and returns the room details.
   * Jitsi creates the room automatically when the first participant joins.
   */
  async generateRoomName(appointmentId: string): Promise<VideoRoomResult> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    // Reuse existing Jitsi roomName if already set and valid
    if (appointment.roomName && appointment.roomName.startsWith('curalink-')) {
      const roomUrl = `https://${this.jitsiDomain}/${appointment.roomName}`;
      if (appointment.roomUrl !== roomUrl) {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { roomUrl },
        });
      }
      return {
        roomName: appointment.roomName,
        roomUrl,
      };
    }

    // Generate unique, hard-to-guess room name (alphanumeric + hyphens)
    const cleanId = appointmentId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    const randomSuffix = crypto.randomBytes(6).toString('hex');
    const roomName = `curalink-${cleanId}-${randomSuffix}`;
    const roomUrl = `https://${this.jitsiDomain}/${roomName}`;

    // Persist to Appointment in database
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        roomName,
        roomUrl,
      },
    });

    return {
      roomName,
      roomUrl,
    };
  }

  /**
   * Alias for generateRoomName to support existing callers
   */
  async createRoom(appointmentId: string): Promise<VideoRoomResult> {
    return this.generateRoomName(appointmentId);
  }
}

export const videoService = new VideoService();
