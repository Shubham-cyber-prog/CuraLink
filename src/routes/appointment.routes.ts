import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '../types/role';
import { validateRequest } from '../middleware/validate.middleware';
import { bookAppointmentSchema, updateAppointmentStatusSchema } from '../validators/appointment.validator';

const router = Router();

// Protect all appointment routes
router.use(authenticate);

router.post('/book', authorize(Role.PATIENT), validateRequest({ body: bookAppointmentSchema }), (req, res, next) => appointmentController.book(req, res, next));
router.post('/', authorize(Role.PATIENT), validateRequest({ body: bookAppointmentSchema }), (req, res, next) => appointmentController.book(req, res, next));
router.get('/my-appointments', authorize(Role.PATIENT, Role.DOCTOR), (req, res, next) => appointmentController.getMyAppointments(req, res, next));
router.get('/me', authorize(Role.PATIENT, Role.DOCTOR), (req, res, next) => appointmentController.getMyAppointments(req, res, next));
router.post('/:id/create-room', (req, res, next) => appointmentController.createRoom(req, res, next));
router.get('/:id/join', (req, res, next) => appointmentController.join(req, res, next));
router.patch('/:id/complete', authorize(Role.DOCTOR, Role.PATIENT, Role.ADMIN), (req, res, next) => appointmentController.complete(req, res, next));
router.post('/:id/complete', authorize(Role.DOCTOR, Role.PATIENT, Role.ADMIN), (req, res, next) => appointmentController.complete(req, res, next));
router.patch('/:id/status', authorize(Role.DOCTOR, Role.PATIENT, Role.ADMIN), validateRequest({ body: updateAppointmentStatusSchema }), async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const upperStatus = String(status).toUpperCase();

    const { default: prisma } = await import('../lib/prisma');
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          select: { id: true, userId: true },
        },
      },
    });

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    const user = req.user!;
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: user.id },
    });
    const doctorIds = [user.id];
    if (doctorProfile) doctorIds.push(doctorProfile.id);

    const isPatient = appointment.userId === user.id;
    const isDoctor =
      doctorIds.includes(appointment.doctorId) ||
      (appointment.doctor && (appointment.doctor.userId === user.id || appointment.doctor.id === doctorProfile?.id));
    const isAdmin = user.role === Role.ADMIN;

    if (!isPatient && !isDoctor && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
      return;
    }

    // Patient can cancel or complete their own appointment (e.g. at the conclusion of consultation)
    if (isPatient && !isDoctor && !isAdmin && upperStatus !== 'CANCELLED' && upperStatus !== 'COMPLETED') {
      res.status(403).json({ success: false, message: 'Patients can only cancel or complete appointments' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: upperStatus },
    });

    if (upperStatus === 'CONFIRMED' || upperStatus === 'CANCELLED') {
      const { emailService } = await import('../services/email/email.service');
      emailService.sendAppointmentStatusEmail(id, upperStatus, req.body.reason).catch((e) =>
        console.error('[AppointmentRoutes] Failed to dispatch appointment status email:', e?.message || e)
      );
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
