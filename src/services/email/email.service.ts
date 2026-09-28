import prisma from '../../lib/prisma';
import { env } from '../../config/env';
import { resendClient } from './resend.client';
import {
  verificationEmailTemplate,
  patientWelcomeTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
} from './templates/auth.templates';
import {
  doctorRegistrationReceivedTemplate,
  doctorVerificationApprovedTemplate,
  doctorVerificationRejectedTemplate,
} from './templates/doctor.templates';
import {
  appointmentBookedPatientTemplate,
  appointmentBookedDoctorTemplate,
  appointmentConfirmedTemplate,
  appointmentCancelledTemplate,
  appointmentRescheduledTemplate,
  appointmentReminderTemplate,
} from './templates/appointment.templates';

export class EmailService {
  private getFrontendUrl(): string {
    return env.APP_URL || process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:3000';
  }

  // ═══════════════════════════════════════════════════════════════════
  // AUTH WORKFLOWS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Send Email Verification Link
   */
  async sendVerificationEmail(user: { id: string; email: string; name: string }, rawToken: string) {
    const frontendUrl = this.getFrontendUrl();
    const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;

    const template = verificationEmailTemplate({
      name: user.name,
      verifyUrl,
      expiresMinutes: 30,
    });

    return resendClient.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      eventType: 'VERIFICATION',
      recipientId: user.id,
      idempotencyKey: `verify_${user.id}_${rawToken.slice(0, 16)}`,
    });
  }

  /**
   * Send Patient Welcome Email
   */
  async sendPatientWelcomeEmail(user: { id: string; email: string; name: string }) {
    const frontendUrl = this.getFrontendUrl();
    const template = patientWelcomeTemplate({
      name: user.name,
      loginUrl: `${frontendUrl}/login`,
      profileUrl: `${frontendUrl}/profile`,
    });

    return resendClient.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      eventType: 'WELCOME',
      recipientId: user.id,
      idempotencyKey: `welcome_${user.id}`,
    });
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordResetEmail(user: { id: string; email: string; name: string }, rawToken: string) {
    const frontendUrl = this.getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    const template = passwordResetTemplate({
      name: user.name,
      resetUrl,
      expiresMinutes: 15,
    });

    return resendClient.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      eventType: 'PASSWORD_RESET',
      recipientId: user.id,
      idempotencyKey: `pwreset_${user.id}_${rawToken.slice(0, 16)}`,
    });
  }

  /**
   * Send Password Changed Notification
   */
  async sendPasswordChangedEmail(user: { id: string; email: string; name: string }, ipAddress?: string) {
    const frontendUrl = this.getFrontendUrl();
    const template = passwordChangedTemplate({
      name: user.name,
      time: new Date().toUTCString(),
      ipAddress,
      supportUrl: `${frontendUrl}/help`,
    });

    return resendClient.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      eventType: 'PASSWORD_CHANGED',
      recipientId: user.id,
      idempotencyKey: `pwchanged_${user.id}_${Date.now()}`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // DOCTOR WORKFLOWS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Send Doctor Registration Received (Pending Review)
   */
  async sendDoctorRegistrationEmail(user: { id: string; email: string; name: string }, profile?: { specialization?: string; medicalLicenseNumber?: string }) {
    const template = doctorRegistrationReceivedTemplate({
      name: user.name,
      specialization: profile?.specialization,
      medicalLicenseNumber: profile?.medicalLicenseNumber,
    });

    return resendClient.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      eventType: 'DOCTOR_REGISTRATION',
      recipientId: user.id,
      idempotencyKey: `docreg_${user.id}`,
    });
  }

  /**
   * Send Doctor Verification Approved
   */
  async sendDoctorApprovedEmail(user: { id: string; email: string; name: string }) {
    const frontendUrl = this.getFrontendUrl();
    const template = doctorVerificationApprovedTemplate({
      name: user.name,
      dashboardUrl: `${frontendUrl}/doctor-dashboard`,
    });

    return resendClient.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      eventType: 'DOCTOR_APPROVED',
      recipientId: user.id,
      idempotencyKey: `docapproved_${user.id}`,
    });
  }

  /**
   * Send Doctor Verification Rejected
   */
  async sendDoctorRejectedEmail(user: { id: string; email: string; name: string }, reason?: string) {
    const frontendUrl = this.getFrontendUrl();
    const template = doctorVerificationRejectedTemplate({
      name: user.name,
      reason,
      supportUrl: `${frontendUrl}/help`,
    });

    return resendClient.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      eventType: 'DOCTOR_REJECTED',
      recipientId: user.id,
      idempotencyKey: `docrejected_${user.id}_${Date.now()}`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // APPOINTMENT WORKFLOWS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Helper to load populated appointment from database
   */
  private async loadAppointment(appointmentId: string) {
    return prisma.appointment.findUnique({
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
  }

  /**
   * When an appointment is booked: Send separate emails to patient and doctor.
   */
  async sendAppointmentBookedEmails(appointmentId: string) {
    const apt = await this.loadAppointment(appointmentId);
    if (!apt || !apt.user || !apt.doctor?.user) return;

    const frontendUrl = this.getFrontendUrl();
    const doctorName = apt.doctor.user.name;
    const patientName = apt.user.name;
    const mode = apt.doctor.consultationModes?.[0] || 'VIDEO';

    // 1. Patient Confirmation
    const patientTpl = appointmentBookedPatientTemplate({
      patientName,
      doctorName,
      specialty: apt.doctor.specialization,
      date: apt.date,
      time: apt.time,
      mode,
      status: apt.status,
      detailsUrl: `${frontendUrl}/appointments`,
      videoInstructions: mode === 'VIDEO',
    });

    await resendClient.sendEmail({
      to: apt.user.email,
      subject: patientTpl.subject,
      html: patientTpl.html,
      text: patientTpl.text,
      eventType: 'APPOINTMENT_BOOKED_PATIENT',
      recipientId: apt.user.id,
      idempotencyKey: `apt_booked_pat_${apt.id}`,
    });

    // 2. Doctor Notification
    const doctorTpl = appointmentBookedDoctorTemplate({
      doctorName,
      patientName,
      date: apt.date,
      time: apt.time,
      mode,
      status: apt.status,
      dashboardUrl: `${frontendUrl}/doctor-dashboard`,
    });

    await resendClient.sendEmail({
      to: apt.doctor.user.email,
      subject: doctorTpl.subject,
      html: doctorTpl.html,
      text: doctorTpl.text,
      eventType: 'APPOINTMENT_BOOKED_DOCTOR',
      recipientId: apt.doctor.userId,
      idempotencyKey: `apt_booked_doc_${apt.id}`,
    });
  }

  /**
   * When appointment status changes (CONFIRMED or CANCELLED)
   */
  async sendAppointmentStatusEmail(appointmentId: string, newStatus: string, reason?: string) {
    const apt = await this.loadAppointment(appointmentId);
    if (!apt || !apt.user || !apt.doctor?.user) return;

    const frontendUrl = this.getFrontendUrl();
    const doctorName = apt.doctor.user.name;
    const patientName = apt.user.name;
    const mode = apt.doctor.consultationModes?.[0] || 'VIDEO';

    if (newStatus === 'CONFIRMED') {
      // Send confirmation to Patient
      const patTpl = appointmentConfirmedTemplate({
        recipientName: patientName,
        otherPartyName: doctorName,
        isDoctor: false,
        date: apt.date,
        time: apt.time,
        mode,
        detailsUrl: `${frontendUrl}/consultation/${apt.id}`,
      });
      await resendClient.sendEmail({
        to: apt.user.email,
        subject: patTpl.subject,
        html: patTpl.html,
        text: patTpl.text,
        eventType: 'APPOINTMENT_CONFIRMED_PATIENT',
        recipientId: apt.user.id,
        idempotencyKey: `apt_confirmed_pat_${apt.id}`,
      });

      // Send confirmation to Doctor
      const docTpl = appointmentConfirmedTemplate({
        recipientName: `Dr. ${doctorName}`,
        otherPartyName: patientName,
        isDoctor: true,
        date: apt.date,
        time: apt.time,
        mode,
        detailsUrl: `${frontendUrl}/consultation/${apt.id}`,
      });
      await resendClient.sendEmail({
        to: apt.doctor.user.email,
        subject: docTpl.subject,
        html: docTpl.html,
        text: docTpl.text,
        eventType: 'APPOINTMENT_CONFIRMED_DOCTOR',
        recipientId: apt.doctor.userId,
        idempotencyKey: `apt_confirmed_doc_${apt.id}`,
      });
    } else if (newStatus === 'CANCELLED') {
      // Send cancellation to Patient
      const patTpl = appointmentCancelledTemplate({
        recipientName: patientName,
        otherPartyName: doctorName,
        isDoctor: false,
        date: apt.date,
        time: apt.time,
        reason,
        rebookUrl: `${frontendUrl}/find-doctor`,
      });
      await resendClient.sendEmail({
        to: apt.user.email,
        subject: patTpl.subject,
        html: patTpl.html,
        text: patTpl.text,
        eventType: 'APPOINTMENT_CANCELLED_PATIENT',
        recipientId: apt.user.id,
        idempotencyKey: `apt_cancelled_pat_${apt.id}`,
      });

      // Send cancellation to Doctor
      const docTpl = appointmentCancelledTemplate({
        recipientName: `Dr. ${doctorName}`,
        otherPartyName: patientName,
        isDoctor: true,
        date: apt.date,
        time: apt.time,
        reason,
      });
      await resendClient.sendEmail({
        to: apt.doctor.user.email,
        subject: docTpl.subject,
        html: docTpl.html,
        text: docTpl.text,
        eventType: 'APPOINTMENT_CANCELLED_DOCTOR',
        recipientId: apt.doctor.userId,
        idempotencyKey: `apt_cancelled_doc_${apt.id}`,
      });
    }
  }

  /**
   * When appointment is rescheduled
   */
  async sendAppointmentRescheduledEmail(appointmentId: string, oldDate: string, oldTime: string) {
    const apt = await this.loadAppointment(appointmentId);
    if (!apt || !apt.user || !apt.doctor?.user) return;

    const frontendUrl = this.getFrontendUrl();
    const doctorName = apt.doctor.user.name;
    const patientName = apt.user.name;
    const mode = apt.doctor.consultationModes?.[0] || 'VIDEO';

    // Patient notification
    const patTpl = appointmentRescheduledTemplate({
      recipientName: patientName,
      otherPartyName: doctorName,
      isDoctor: false,
      oldDate,
      oldTime,
      newDate: apt.date,
      newTime: apt.time,
      mode,
      detailsUrl: `${frontendUrl}/appointments`,
    });
    await resendClient.sendEmail({
      to: apt.user.email,
      subject: patTpl.subject,
      html: patTpl.html,
      text: patTpl.text,
      eventType: 'APPOINTMENT_RESCHEDULED_PATIENT',
      recipientId: apt.user.id,
      idempotencyKey: `apt_resched_pat_${apt.id}_${apt.date}_${apt.time}`,
    });

    // Doctor notification
    const docTpl = appointmentRescheduledTemplate({
      recipientName: `Dr. ${doctorName}`,
      otherPartyName: patientName,
      isDoctor: true,
      oldDate,
      oldTime,
      newDate: apt.date,
      newTime: apt.time,
      mode,
      detailsUrl: `${frontendUrl}/doctor-dashboard`,
    });
    await resendClient.sendEmail({
      to: apt.doctor.user.email,
      subject: docTpl.subject,
      html: docTpl.html,
      text: docTpl.text,
      eventType: 'APPOINTMENT_RESCHEDULED_DOCTOR',
      recipientId: apt.doctor.userId,
      idempotencyKey: `apt_resched_doc_${apt.id}_${apt.date}_${apt.time}`,
    });
  }

  /**
   * Send Appointment Reminder (e.g. 24 hours or 1 hour prior)
   */
  async sendAppointmentReminderEmail(appointmentId: string, reminderType: '24H' | '1H') {
    const apt = await this.loadAppointment(appointmentId);
    if (!apt || !apt.user || !apt.doctor?.user || apt.status !== 'CONFIRMED') return;

    const frontendUrl = this.getFrontendUrl();
    const doctorName = apt.doctor.user.name;
    const patientName = apt.user.name;
    const hours = reminderType === '24H' ? 24 : 1;
    const mode = apt.doctor.consultationModes?.[0] || 'VIDEO';

    // 1. Patient Reminder
    const patTpl = appointmentReminderTemplate({
      recipientName: patientName,
      otherPartyName: doctorName,
      isDoctor: false,
      date: apt.date,
      time: apt.time,
      mode,
      hoursUntil: hours,
      detailsUrl: `${frontendUrl}/consultation/${apt.id}`,
      videoInstructions: mode === 'VIDEO',
    });

    await resendClient.sendEmail({
      to: apt.user.email,
      subject: patTpl.subject,
      html: patTpl.html,
      text: patTpl.text,
      eventType: `REMINDER_${reminderType}_PATIENT`,
      recipientId: apt.user.id,
      idempotencyKey: `remind_${reminderType}_pat_${apt.id}`,
    });

    // 2. Doctor Reminder
    const docTpl = appointmentReminderTemplate({
      recipientName: `Dr. ${doctorName}`,
      otherPartyName: patientName,
      isDoctor: true,
      date: apt.date,
      time: apt.time,
      mode,
      hoursUntil: hours,
      detailsUrl: `${frontendUrl}/consultation/${apt.id}`,
      videoInstructions: mode === 'VIDEO',
    });

    await resendClient.sendEmail({
      to: apt.doctor.user.email,
      subject: docTpl.subject,
      html: docTpl.html,
      text: docTpl.text,
      eventType: `REMINDER_${reminderType}_DOCTOR`,
      recipientId: apt.doctor.userId,
      idempotencyKey: `remind_${reminderType}_doc_${apt.id}`,
    });
  }
}

export const emailService = new EmailService();
