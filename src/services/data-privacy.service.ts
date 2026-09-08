import { prisma } from '../lib/prisma';
import { RequestErasureInput } from '../validators/privacy.validator';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { notificationService } from './notification.service';

export class DataPrivacyService {
  async requestErasure(userId: string, input: RequestErasureInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check for active pending request
    const pendingRequest = await prisma.dataErasureRequest.findFirst({
      where: { userId, status: 'PENDING' },
    });

    if (pendingRequest) {
      throw new BadRequestError('A data erasure request is already pending for your account.');
    }

    const erasureRequest = await prisma.dataErasureRequest.create({
      data: {
        userId,
        reason: input.reason || 'User requested account erasure under DPDP Act 2023',
        status: 'PENDING',
      },
    });

    // Notify user of erasure request submission
    await notificationService.send({
      recipientId: userId,
      recipientEmail: user.email,
      subject: 'CuraLink DPDP Act 2023 - Data Erasure Request Received',
      body: `Your request for account data erasure (Ref: ${erasureRequest.id}) has been submitted. Our compliance team will process it within 30 days.`,
      channels: ['EMAIL'],
    });

    return erasureRequest;
  }

  async processErasureRequest(requestId: string, adminId: string) {
    const erasureRequest = await prisma.dataErasureRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!erasureRequest) {
      throw new NotFoundError('Erasure request not found');
    }

    if (erasureRequest.status !== 'PENDING') {
      throw new BadRequestError(`Erasure request is already ${erasureRequest.status}`);
    }

    const { userId, user } = erasureRequest;

    // DPDP Act 2023 Anonymization Pipeline:
    // PII (Name, Email, Phone, Passwords) are anonymized. Medical records are retained in compliance with NMC Telemedicine Guidelines 2020 (3-year mandate).
    const anonymizedEmail = `anonymized_${userId.slice(0, 8)}@privacy.curalink.local`;
    const anonymizedName = `Anonymized User (${userId.slice(0, 6)})`;

    await prisma.$transaction([
      // Anonymize user record
      prisma.user.update({
        where: { id: userId },
        data: {
          name: anonymizedName,
          email: anonymizedEmail,
          passwordHash: 'ANONYMIZED_ACCOUNT_DELETED',
        },
      }),
      // Mark erasure request as COMPLETED
      prisma.dataErasureRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      }),
    ]);

    // Send final notification to original user email before losing record link
    await notificationService.send({
      recipientId: userId,
      recipientEmail: user.email,
      subject: 'CuraLink DPDP Act 2023 - Account Data Erasure Completed',
      body: `Your personal data has been anonymized and account access deactivated in compliance with the Digital Personal Data Protection (DPDP) Act 2023.`,
      channels: ['EMAIL'],
    });

    return {
      success: true,
      message: `User ${userId} data has been anonymized and erasure request completed.`,
    };
  }

  async getUserPrivacyStatus(userId: string) {
    const requests = await prisma.dataErasureRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: 'desc' },
    });

    return {
      dpdpCompliance: 'Active',
      dataErasureRequests: requests,
    };
  }
}

export const dataPrivacyService = new DataPrivacyService();
