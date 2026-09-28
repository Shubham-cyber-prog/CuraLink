import { escapeHtml } from '../../src/services/email/templates/escape-html';
import { renderBaseEmailTemplate } from '../../src/services/email/templates/base.template';
import {
  verificationEmailTemplate,
  patientWelcomeTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
} from '../../src/services/email/templates/auth.templates';
import {
  doctorRegistrationReceivedTemplate,
  doctorVerificationApprovedTemplate,
  doctorVerificationRejectedTemplate,
} from '../../src/services/email/templates/doctor.templates';
import {
  appointmentBookedPatientTemplate,
  appointmentBookedDoctorTemplate,
  appointmentConfirmedTemplate,
  appointmentCancelledTemplate,
  appointmentRescheduledTemplate,
  appointmentReminderTemplate,
} from '../../src/services/email/templates/appointment.templates';

describe('Email Templates & Security Unit Tests', () => {
  describe('HTML Escaping & Security', () => {
    it('escapes dangerous characters to prevent XSS injection in emails', () => {
      const untrusted = '<script>alert("hack")</script> & "special" \'chars\'';
      const escaped = escapeHtml(untrusted);

      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&quot;special&quot;');
      expect(escaped).toContain('&#39;chars&#39;');
    });

    it('handles empty or non-string inputs gracefully', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(undefined as any)).toBe('');
      expect(escapeHtml(null as any)).toBe('');
    });
  });

  describe('Base Template Layout', () => {
    it('renders with CuraLink branding, Navy header, Teal accent, and plain text', () => {
      const html = renderBaseEmailTemplate({
        title: 'Test Email Title',
        preheader: 'Test Preheader Text',
        contentHtml: '<p>Test email body content</p>',
      });

      expect(html).toContain('CuraLink');
      expect(html).toContain('#0F172A'); // Deep Navy
      expect(html).toContain('#0D9488'); // Teal
      expect(html).toContain('Test Email Title');
      expect(html).toContain('Test email body content');
      expect(html).toContain('CuraLink Healthcare Telehealth Network');
    });
  });

  describe('Authentication & Account Templates', () => {
    it('renders verificationEmailTemplate with secure link and plain text alternative', () => {
      const tmpl = verificationEmailTemplate({
        name: 'Jane Doe <script>',
        verifyUrl: 'https://curalink.health/verify-email?token=abc12345',
        expiresMinutes: 30,
      });

      expect(tmpl.subject).toContain('Verify your CuraLink');
      expect(tmpl.html).toContain('Jane Doe &lt;script&gt;');
      expect(tmpl.html).toContain('https://curalink.health/verify-email?token=abc12345');
      expect(tmpl.html).toContain('30 minutes');
      expect(tmpl.text).toContain('Jane Doe <script>');
      expect(tmpl.text).toContain('https://curalink.health/verify-email?token=abc12345');
    });

    it('renders patientWelcomeTemplate with login link', () => {
      const tmpl = patientWelcomeTemplate({
        name: 'John Patient',
        loginUrl: 'https://curalink.health/login',
      });

      expect(tmpl.subject).toContain('Welcome to CuraLink');
      expect(tmpl.html).toContain('John Patient');
      expect(tmpl.html).toContain('https://curalink.health/login');
      expect(tmpl.text).toContain('Welcome to CuraLink');
    });

    it('renders passwordResetTemplate with secure expiration warning', () => {
      const tmpl = passwordResetTemplate({
        name: 'Alice',
        resetUrl: 'https://curalink.health/reset-password?token=secrettoken',
        expiresMinutes: 15,
      });

      expect(tmpl.subject).toContain('Password Reset');
      expect(tmpl.html).toContain('15 minutes');
      expect(tmpl.html).toContain('https://curalink.health/reset-password?token=secrettoken');
      expect(tmpl.text).toContain('15 minutes');
    });

    it('renders passwordChangedTemplate without sensitive credentials', () => {
      const tmpl = passwordChangedTemplate({
        name: 'Bob',
        time: 'Sept 28, 2026, 12:00 UTC',
      });

      expect(tmpl.subject).toContain('Security Alert');
      expect(tmpl.html).toContain('Sept 28, 2026, 12:00 UTC');
      expect(tmpl.html).not.toContain('password123'); // must not contain actual password values
      expect(tmpl.text).toContain('successfully updated');
    });
  });

  describe('Doctor Verification Templates', () => {
    it('renders doctorRegistrationReceivedTemplate showing pending status', () => {
      const tmpl = doctorRegistrationReceivedTemplate({
        name: 'Gregory House',
        specialization: 'Diagnostic Medicine',
        medicalLicenseNumber: 'MD-99887766',
      });

      expect(tmpl.subject).toContain('Registration Received');
      expect(tmpl.html).toContain('Gregory House');
      expect(tmpl.html).toContain('Diagnostic Medicine');
      expect(tmpl.html).toContain('MD-99887766');
      expect(tmpl.html).toContain('PENDING');
      expect(tmpl.text).toContain('PENDING');
    });

    it('renders doctorVerificationApprovedTemplate with dashboard CTA', () => {
      const tmpl = doctorVerificationApprovedTemplate({
        name: 'Allison Cameron',
        dashboardUrl: 'https://curalink.health/doctor/dashboard',
      });

      expect(tmpl.subject).toContain('Credentials Have Been Verified');
      expect(tmpl.html).toContain('Allison Cameron');
      expect(tmpl.html).toContain('https://curalink.health/doctor/dashboard');
      expect(tmpl.text).toContain('have been verified');
    });

    it('renders doctorVerificationRejectedTemplate with reason', () => {
      const tmpl = doctorVerificationRejectedTemplate({
        name: 'Dr. Eric Foreman',
        reason: 'License expired in state medical registry',
      });

      expect(tmpl.subject).toContain('Practitioner Verification');
      expect(tmpl.html).toContain('Dr. Eric Foreman');
      expect(tmpl.html).toContain('License expired in state medical registry');
      expect(tmpl.text).toContain('License expired in state medical registry');
    });
  });

  describe('Appointment Lifecycle Templates', () => {
    it('renders appointmentBookedPatientTemplate with video instructions', () => {
      const tmpl = appointmentBookedPatientTemplate({
        patientName: 'Sarah Connor',
        doctorName: 'James Wilson',
        specialty: 'Oncology',
        date: 'October 15, 2026',
        time: '10:00 AM',
        mode: 'VIDEO',
        status: 'PENDING',
        detailsUrl: 'https://curalink.health/appointments/apt_12345',
        videoInstructions: true,
      });

      expect(tmpl.subject).toContain('Appointment Requested with Dr. James Wilson');
      expect(tmpl.html).toContain('Sarah Connor');
      expect(tmpl.html).toContain('James Wilson');
      expect(tmpl.html).toContain('October 15, 2026');
      expect(tmpl.html).toContain('Secure Video Telehealth');
      expect(tmpl.html).toContain('https://curalink.health/appointments/apt_12345');
      expect(tmpl.text).toContain('https://curalink.health/appointments/apt_12345');
    });

    it('renders appointmentBookedDoctorTemplate with patient details', () => {
      const tmpl = appointmentBookedDoctorTemplate({
        doctorName: 'James Wilson',
        patientName: 'Sarah Connor',
        date: 'October 15, 2026',
        time: '10:00 AM',
        mode: 'VIDEO',
        status: 'PENDING',
        dashboardUrl: 'https://curalink.health/doctor/appointments/apt_12345',
      });

      expect(tmpl.subject).toContain('New Appointment Request');
      expect(tmpl.html).toContain('Dr. James Wilson');
      expect(tmpl.html).toContain('Sarah Connor');
      expect(tmpl.html).toContain('https://curalink.health/doctor/appointments/apt_12345');
    });

    it('renders appointmentConfirmedTemplate', () => {
      const tmpl = appointmentConfirmedTemplate({
        recipientName: 'Sarah Connor',
        otherPartyName: 'James Wilson',
        isDoctor: false,
        date: 'October 15, 2026',
        time: '10:00 AM',
        mode: 'VIDEO',
        detailsUrl: 'https://curalink.health/appointments/apt_12345',
      });

      expect(tmpl.subject).toContain('Appointment Confirmed with Dr. James Wilson');
      expect(tmpl.html).toContain('Dr. James Wilson');
      expect(tmpl.html).toContain('Sarah Connor');
    });

    it('renders appointmentCancelledTemplate with cancellation reason', () => {
      const tmpl = appointmentCancelledTemplate({
        recipientName: 'Sarah Connor',
        otherPartyName: 'James Wilson',
        isDoctor: false,
        date: 'October 15, 2026',
        time: '10:00 AM',
        reason: 'Schedule conflict',
        rebookUrl: 'https://curalink.health/doctors',
      });

      expect(tmpl.subject).toContain('Appointment Cancelled');
      expect(tmpl.html).toContain('Schedule conflict');
      expect(tmpl.text).toContain('Schedule conflict');
    });

    it('renders appointmentRescheduledTemplate with old and new times', () => {
      const tmpl = appointmentRescheduledTemplate({
        recipientName: 'Sarah Connor',
        otherPartyName: 'James Wilson',
        isDoctor: false,
        oldDate: 'October 14, 2026',
        oldTime: '2:00 PM',
        newDate: 'October 15, 2026',
        newTime: '10:00 AM',
        mode: 'VIDEO',
        detailsUrl: 'https://curalink.health/appointments/apt_12345',
      });

      expect(tmpl.subject).toContain('Appointment Rescheduled');
      expect(tmpl.html).toContain('October 14, 2026');
      expect(tmpl.html).toContain('October 15, 2026');
      expect(tmpl.text).toContain('October 15, 2026');
    });

    it('renders appointmentReminderTemplate with reminder window', () => {
      const tmpl = appointmentReminderTemplate({
        recipientName: 'Sarah Connor',
        otherPartyName: 'James Wilson',
        isDoctor: false,
        date: 'October 15, 2026',
        time: '10:00 AM',
        mode: 'VIDEO',
        hoursUntil: 24,
        detailsUrl: 'https://curalink.health/appointments/apt_12345',
      });

      expect(tmpl.subject).toContain('Reminder: Consultation with Dr. James Wilson in 24 Hours');
      expect(tmpl.html).toContain('October 15, 2026');
      expect(tmpl.html).toContain('10:00 AM');
      expect(tmpl.text).toContain('24 hours');
    });
  });
});
