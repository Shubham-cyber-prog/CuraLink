import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { doctorVerificationService } from '../services/doctor-verification.service';
import { dataPrivacyService } from '../services/data-privacy.service';
import { auditService, AuditAction } from '../services/audit.service';
import { updateVerificationStatusSchema } from '../validators/doctor.validator';

export class AdminController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalUsers,
        patientCount,
        doctorCount,
        verifiedDoctors,
        pendingVerifications,
        totalAppointments,
        totalPrescriptions,
        pendingErasureRequests,
        totalAuditLogs,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'PATIENT' } }),
        prisma.user.count({ where: { role: 'DOCTOR' } }),
        prisma.doctorProfile.count({ where: { verificationStatus: 'APPROVED' } }),
        prisma.doctorProfile.count({ where: { verificationStatus: 'PENDING' } }),
        prisma.appointment.count(),
        prisma.prescription.count(),
        prisma.dataErasureRequest.count({ where: { status: 'PENDING' } }),
        prisma.auditLog.count(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          patientCount,
          doctorCount,
          verifiedDoctors,
          pendingVerifications,
          totalAppointments,
          totalPrescriptions,
          pendingErasureRequests,
          totalAuditLogs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = typeof req.query.role === 'string' ? req.query.role.toUpperCase() : undefined;
      const whereClause = role ? { role } : {};

      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          phoneVerified: true,
          age: true,
          gender: true,
          createdAt: true,
          updatedAt: true,
          doctorProfile: {
            select: {
              id: true,
              specialization: true,
              medicalLicenseNumber: true,
              verificationStatus: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctors = await prisma.doctorProfile.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          },
        },
        orderBy: [{ verificationStatus: 'asc' }, { createdAt: 'desc' }],
      });

      res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  }

  async setDoctorVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = String(req.params.doctorId);
      const { status } = updateVerificationStatusSchema.parse(req.body);
      const adminId = req.user!.id;

      const profile = await doctorVerificationService.setVerificationStatus(doctorId, status);

      await auditService.logAction(
        AuditAction.UPDATE,
        adminId,
        'AdminDoctorVerificationStatusUpdate',
        doctorId,
        req.ip,
        req.headers['user-agent'],
        { status }
      );

      res.status(200).json({
        success: true,
        message: `Doctor verification status updated to ${status}`,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointments = await prisma.appointment.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          doctor: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          payment: {
            select: { status: true, amount: true },
          },
          prescription: {
            select: { id: true, diagnosis: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = typeof req.query.limit === 'string' ? Math.min(parseInt(req.query.limit, 10), 100) : 50;

      const logs = await prisma.auditLog.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getErasureRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await prisma.dataErasureRequest.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  async processErasureRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = String(req.params.requestId);
      const adminId = req.user!.id;

      const result = await dataPrivacyService.processErasureRequest(requestId, adminId);

      await auditService.logAction(
        AuditAction.UPDATE,
        adminId,
        'AdminDataErasureProcessed',
        requestId,
        req.ip,
        req.headers['user-agent']
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
