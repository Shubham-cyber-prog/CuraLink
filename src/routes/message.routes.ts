import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth.middleware';
import { Role } from '../types/role';

const router = Router();

// Protect all messaging routes
router.use(authenticate);

/**
 * Helper to check whether requesting user belongs to the appointment as patient, doctor, or admin
 */
async function getAppointmentAndCheckAccess(appointmentId: string, userId: string, role: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      doctor: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!appointment) {
    return { appointment: null, error: 'Appointment not found', status: 404 };
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId },
  });
  const doctorIds = [userId];
  if (doctorProfile) doctorIds.push(doctorProfile.id);

  const isPatient = appointment.userId === userId;
  const isDoctor =
    doctorIds.includes(appointment.doctorId) ||
    (appointment.doctor && (appointment.doctor.userId === userId || appointment.doctor.id === doctorProfile?.id));
  const isAdmin = role === Role.ADMIN;

  if (!isPatient && !isDoctor && !isAdmin) {
    return {
      appointment: null,
      error: 'You do not have permission to message for this appointment. Users cannot message people they have no appointment with.',
      status: 403,
    };
  }

  const resolvedDoctorUserId = appointment.doctor?.userId || appointment.doctorId;

  return {
    appointment,
    isPatient,
    isDoctor,
    resolvedDoctorUserId,
    status: 200,
  };
}

/**
 * GET /api/messages?appointmentId=...
 * Retrieve all messages for a specific consultation/appointment
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointmentId = String(req.query.appointmentId || '');
    if (!appointmentId) {
      res.status(400).json({ success: false, message: 'appointmentId is required' });
      return;
    }

    const access = await getAppointmentAndCheckAccess(appointmentId, req.user!.id, req.user!.role);
    if (!access.appointment) {
      res.status(access.status).json({ success: false, message: access.error });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/messages
 * Send a message within an established appointment
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appointmentId, content } = req.body;
    if (!appointmentId || !content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ success: false, message: 'appointmentId and non-empty content are required' });
      return;
    }

    const access = await getAppointmentAndCheckAccess(appointmentId, req.user!.id, req.user!.role);
    if (!access.appointment) {
      res.status(access.status).json({ success: false, message: access.error });
      return;
    }

    const currentUserId = req.user!.id;
    let receiverId = '';
    if (access.isPatient) {
      receiverId = access.resolvedDoctorUserId;
    } else {
      receiverId = access.appointment.userId;
    }

    const newMessage = await prisma.message.create({
      data: {
        appointmentId,
        senderId: currentUserId,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/messages/conversations
 * Retrieve active message threads/contacts based on user appointments
 */
router.get('/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });
    const doctorIds = [userId];
    if (doctorProfile) doctorIds.push(doctorProfile.id);

    const appointments = await prisma.appointment.findMany({
      where: role === Role.DOCTOR
        ? { doctorId: { in: doctorIds } }
        : { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        doctor: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const conversations = appointments.map((appt) => {
      const otherUser =
        role === Role.DOCTOR
          ? {
              id: appt.user.id,
              name: appt.user.name,
              email: appt.user.email,
              role: 'PATIENT',
            }
          : {
              id: appt.doctor?.user?.id || appt.doctorId,
              name: appt.doctor?.user?.name ? `Dr. ${appt.doctor.user.name.replace(/^Dr\.\s*/i, '')}` : 'Attending Doctor',
              email: appt.doctor?.user?.email || '',
              role: 'DOCTOR',
              specialty: appt.doctor?.specialization || 'Specialist',
            };

      return {
        appointmentId: appt.id,
        date: appt.date,
        time: appt.time,
        status: appt.status,
        contact: otherUser,
        lastMessage: appt.messages[0] || null,
      };
    });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
