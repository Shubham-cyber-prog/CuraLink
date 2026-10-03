import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { doctorVerificationService } from '../services/doctor-verification.service';
import { dataPrivacyService } from '../services/data-privacy.service';
import { auditService, AuditAction } from '../services/audit.service';
import { updateVerificationStatusSchema } from '../validators/doctor.validator';
import { parsePaginationParams, buildPaginatedResponse } from '../validators/pagination.validator';

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
      const { limit, page, cursor, skip } = parsePaginationParams(req.query);

      const [total, users] = await Promise.all([
        prisma.user.count({ where: whereClause }),
        prisma.user.findMany({
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
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : { skip }),
          take: limit + 1,
        }),
      ]);

      res.status(200).json({
        success: true,
        ...buildPaginatedResponse(users, total, limit, page),
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit, page, cursor, skip } = parsePaginationParams(req.query);

      const [total, doctors] = await Promise.all([
        prisma.doctorProfile.count(),
        prisma.doctorProfile.findMany({
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
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : { skip }),
          take: limit + 1,
        }),
      ]);

      res.status(200).json({
        success: true,
        ...buildPaginatedResponse(doctors, total, limit, page),
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
      const { limit, page, cursor, skip } = parsePaginationParams(req.query);

      const [total, appointments] = await Promise.all([
        prisma.appointment.count(),
        prisma.appointment.findMany({
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
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : { skip }),
          take: limit + 1,
        }),
      ]);

      res.status(200).json({
        success: true,
        ...buildPaginatedResponse(appointments, total, limit, page),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit, page, cursor, skip } = parsePaginationParams(req.query);

      const [total, logs] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.findMany({
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : { skip }),
          take: limit + 1,
        }),
      ]);

      res.status(200).json({
        success: true,
        ...buildPaginatedResponse(logs, total, limit, page),
      });
    } catch (error) {
      next(error);
    }
  }

  async getErasureRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit, page, cursor, skip } = parsePaginationParams(req.query);

      const [total, requests] = await Promise.all([
        prisma.dataErasureRequest.count(),
        prisma.dataErasureRequest.findMany({
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : { skip }),
          take: limit + 1,
        }),
      ]);

      res.status(200).json({
        success: true,
        ...buildPaginatedResponse(requests, total, limit, page),
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
