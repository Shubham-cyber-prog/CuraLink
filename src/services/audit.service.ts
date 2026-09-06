import prisma from '../lib/prisma';

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  APPOINTMENT_BOOK = 'APPOINTMENT_BOOK',
  APPOINTMENT_CANCEL = 'APPOINTMENT_CANCEL',
  MEDICAL_RECORD_ACCESS = 'MEDICAL_RECORD_ACCESS',
  PASSWORD_RESET = 'PASSWORD_RESET',
  CONSULTATION_JOIN = 'CONSULTATION_JOIN',
  CONSULTATION_COMPLETE = 'CONSULTATION_COMPLETE',
}

export class AuditService {
  async logAction(
    action: AuditAction,
    userId?: string,
    resource?: string,
    resourceId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          ipAddress,
          userAgent,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    } catch (error) {
      // Don't fail the main request if audit logging fails, but log the error
      console.error('Failed to create audit log:', error);
    }
  }
}

export const auditService = new AuditService();
