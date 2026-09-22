import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '../types/role';

const router = Router();

// Protect all appointment routes
router.use(authenticate);

router.post('/book', authorize(Role.PATIENT), (req, res, next) => appointmentController.book(req, res, next));
router.post('/', authorize(Role.PATIENT), (req, res, next) => appointmentController.book(req, res, next));
router.get('/my-appointments', authorize(Role.PATIENT, Role.DOCTOR), (req, res, next) => appointmentController.getMyAppointments(req, res, next));
router.post('/:id/create-room', (req, res, next) => appointmentController.createRoom(req, res, next));
router.get('/:id/join', (req, res, next) => appointmentController.join(req, res, next));
router.patch('/:id/status', authorize(Role.DOCTOR, Role.PATIENT, Role.ADMIN), async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required' });
      return;
    }

    const upperStatus = String(status).toUpperCase();
    if (!['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(upperStatus)) {
      res.status(400).json({ success: false, message: 'Invalid appointment status' });
      return;
    }

    const { default: prisma } = await import('../lib/prisma');
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    const user = req.user!;
    const isPatient = appointment.userId === user.id;
    const isDoctor = appointment.doctorId === user.id || user.role === Role.DOCTOR;
    const isAdmin = user.role === Role.ADMIN;

    if (!isPatient && !isDoctor && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
      return;
    }

    // Patient can only cancel their own appointment
    if (isPatient && !isDoctor && !isAdmin && upperStatus !== 'CANCELLED') {
      res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: upperStatus },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
