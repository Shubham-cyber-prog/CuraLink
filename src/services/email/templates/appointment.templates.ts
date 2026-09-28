import { renderBaseEmailTemplate } from './base.template';
import { escapeHtml } from './escape-html';
import { EmailRenderOutput } from './auth.templates';

/**
 * 1. Appointment Booked (Sent to Patient)
 */
export function appointmentBookedPatientTemplate(params: {
  patientName: string;
  doctorName: string;
  specialty?: string;
  date: string;
  time: string;
  timezone?: string;
  mode: string;
  status: string;
  detailsUrl: string;
  videoInstructions?: boolean;
}): EmailRenderOutput {
  const safePatient = escapeHtml(params.patientName);
  const safeDoctor = escapeHtml(params.doctorName);
  const safeSpecialty = escapeHtml(params.specialty || 'General Practice');
  const safeDate = escapeHtml(params.date);
  const safeTime = escapeHtml(params.time);
  const safeTz = escapeHtml(params.timezone || 'Local Clinical Time');
  const isVideo = params.mode?.toUpperCase() === 'VIDEO' || params.videoInstructions;
  const subject = `Appointment Requested with Dr. ${safeDoctor} — CuraLink`;

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Appointment Request Received
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Hello ${safePatient}, your appointment request with <strong>Dr. ${safeDoctor}</strong> has been created and is awaiting doctor confirmation.
    </p>

    <!-- Appointment Card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 20px 0; border-left: 4px solid #0D9488;">
      <tr>
        <td style="padding: 20px 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0F172A;">Consultation Details</h3>
          <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px; color: #475569;">
            <tr>
              <td width="35%" style="color: #64748B;">Practitioner:</td>
              <td style="font-weight: 600; color: #0F172A;">Dr. ${safeDoctor} (${safeSpecialty})</td>
            </tr>
            <tr>
              <td style="color: #64748B;">Date:</td>
              <td style="font-weight: 600; color: #0F172A;">${safeDate}</td>
            </tr>
            <tr>
              <td style="color: #64748B;">Time:</td>
              <td style="font-weight: 600; color: #0F172A;">${safeTime} (${safeTz})</td>
            </tr>
            <tr>
              <td style="color: #64748B;">Mode:</td>
              <td style="font-weight: 600; color: #0F172A;">${isVideo ? '🎥 Secure Video Telehealth' : '🏥 In-Person Consultation'}</td>
            </tr>
            <tr>
              <td style="color: #64748B;">Status:</td>
              <td>
                <span style="display: inline-block; background-color: #FEF3C7; color: #92400E; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                  ${escapeHtml(params.status)}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${isVideo ? `
    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #166534; line-height: 20px;">
      <strong>Video Consultation Instructions:</strong><br/>
      Your private encrypted consultation room will become accessible 15 minutes prior to the scheduled time once the doctor confirms your request. Please test your camera and microphone in advance.
    </div>
    ` : ''}

    <div style="text-align: center; margin: 32px 0;">
      <a href="${params.detailsUrl}" style="display: inline-block; background-color: #0D9488; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.25);">
        View Appointment Details
      </a>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Appointment request with Dr. ${params.doctorName} on ${params.date} at ${params.time}`,
    title: subject,
    contentHtml,
  });

  const text = `Hello ${params.patientName},\n\nYour appointment request with Dr. ${params.doctorName} has been received.\n\nDate: ${params.date}\nTime: ${params.time}\nMode: ${isVideo ? 'Video' : 'In-Person'}\nStatus: ${params.status}\n\nView details:\n${params.detailsUrl}`;

  return { subject, html, text };
}

/**
 * 2. Appointment Notification (Sent to Doctor)
 */
export function appointmentBookedDoctorTemplate(params: {
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  timezone?: string;
  mode: string;
  status: string;
  dashboardUrl: string;
}): EmailRenderOutput {
  const safeDoctor = escapeHtml(params.doctorName);
  const safePatient = escapeHtml(params.patientName);
  const safeDate = escapeHtml(params.date);
  const safeTime = escapeHtml(params.time);
  const safeTz = escapeHtml(params.timezone || 'Local Clinical Time');
  const isVideo = params.mode?.toUpperCase() === 'VIDEO';
  const subject = `New Appointment Request: ${safePatient} on ${safeDate} at ${safeTime}`;

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      New Appointment Request, Dr. ${safeDoctor}
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; line-height: 24px;">
      A patient has requested a consultation on your CuraLink calendar. Please review and accept or reschedule the request.
    </p>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 20px 0; border-left: 4px solid #0F172A;">
      <tr>
        <td style="padding: 20px 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0F172A;">Request Details</h3>
          <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px; color: #475569;">
            <tr>
              <td width="35%" style="color: #64748B;">Patient Name:</td>
              <td style="font-weight: 600; color: #0F172A;">${safePatient}</td>
            </tr>
            <tr>
              <td style="color: #64748B;">Scheduled Date:</td>
              <td style="font-weight: 600; color: #0F172A;">${safeDate}</td>
            </tr>
            <tr>
              <td style="color: #64748B;">Scheduled Time:</td>
              <td style="font-weight: 600; color: #0F172A;">${safeTime} (${safeTz})</td>
            </tr>
            <tr>
              <td style="color: #64748B;">Mode:</td>
              <td style="font-weight: 600; color: #0F172A;">${isVideo ? '🎥 Secure Video Telehealth' : '🏥 In-Person Consultation'}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${params.dashboardUrl}" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">
        Review in Doctor Dashboard
      </a>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `New consultation request from ${params.patientName} on ${params.date} at ${params.time}`,
    title: subject,
    contentHtml,
  });

  const text = `Dr. ${params.doctorName},\n\nYou have received a new consultation request from ${params.patientName}.\n\nDate: ${params.date}\nTime: ${params.time}\nMode: ${params.mode}\n\nReview request in your dashboard:\n${params.dashboardUrl}`;

  return { subject, html, text };
}

/**
 * 3. Appointment Confirmed
 */
export function appointmentConfirmedTemplate(params: {
  recipientName: string;
  otherPartyName: string;
  isDoctor: boolean;
  date: string;
  time: string;
  timezone?: string;
  mode: string;
  detailsUrl: string;
}): EmailRenderOutput {
  const safeRecipient = escapeHtml(params.recipientName);
  const safeOther = escapeHtml(params.otherPartyName);
  const safeDate = escapeHtml(params.date);
  const safeTime = escapeHtml(params.time);
  const isVideo = params.mode?.toUpperCase() === 'VIDEO';
  const roleLabel = params.isDoctor ? 'Patient' : 'Doctor';
  const subject = `Appointment Confirmed with ${params.isDoctor ? '' : 'Dr. '}${safeOther} — ${safeDate}`;

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Appointment Confirmed
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Hello ${safeRecipient}, your consultation with <strong>${params.isDoctor ? '' : 'Dr. '}${safeOther}</strong> has been confirmed.
    </p>

    <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #065F46;">
        📅 Scheduled Consultation
      </h3>
      <p style="margin: 0; font-size: 14px; color: #047857; line-height: 22px;">
        &bull; <strong>${roleLabel}:</strong> ${params.isDoctor ? '' : 'Dr. '}${safeOther}<br/>
        &bull; <strong>Date:</strong> ${safeDate}<br/>
        &bull; <strong>Time:</strong> ${safeTime} (${escapeHtml(params.timezone || 'Local Time')})<br/>
        &bull; <strong>Consultation Mode:</strong> ${isVideo ? 'Encrypted Video Room' : 'In-Person Facility'}
      </p>
    </div>

    ${isVideo ? `
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 22px;">
      When it is time for your appointment, open the details page below and click <strong>Join Consultation Room</strong>.
    </p>
    ` : ''}

    <div style="text-align: center; margin: 28px 0;">
      <a href="${params.detailsUrl}" style="display: inline-block; background-color: #0D9488; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">
        View Appointment & Room Link
      </a>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Confirmed: Consultation with ${params.otherPartyName} on ${params.date} at ${params.time}`,
    title: subject,
    contentHtml,
  });

  const text = `Hello ${params.recipientName},\n\nYour consultation with ${params.otherPartyName} has been confirmed.\n\nDate: ${params.date}\nTime: ${params.time}\nMode: ${params.mode}\n\nView appointment:\n${params.detailsUrl}`;

  return { subject, html, text };
}

/**
 * 4. Appointment Cancelled
 */
export function appointmentCancelledTemplate(params: {
  recipientName: string;
  otherPartyName: string;
  isDoctor: boolean;
  date: string;
  time: string;
  reason?: string;
  rebookUrl?: string;
}): EmailRenderOutput {
  const safeRecipient = escapeHtml(params.recipientName);
  const safeOther = escapeHtml(params.otherPartyName);
  const safeReason = escapeHtml(params.reason || 'Requested by participant or schedule adjustment.');
  const subject = `Appointment Cancelled: Consultation on ${escapeHtml(params.date)}`;

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Appointment Cancelled
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Hello ${safeRecipient}, the scheduled appointment with <strong>${params.isDoctor ? '' : 'Dr. '}${safeOther}</strong> for <strong>${escapeHtml(params.date)} at ${escapeHtml(params.time)}</strong> has been cancelled.
    </p>

    <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #991B1B;">Cancellation Information:</h3>
      <p style="margin: 0; font-size: 14px; color: #7F1D1D; line-height: 20px;">
        ${safeReason}
      </p>
    </div>

    ${params.rebookUrl ? `
    <div style="text-align: center; margin: 28px 0;">
      <a href="${params.rebookUrl}" style="display: inline-block; background-color: #0D9488; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
        Book Alternative Time Slot
      </a>
    </div>
    ` : ''}
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Notice: Appointment on ${params.date} at ${params.time} has been cancelled`,
    title: subject,
    contentHtml,
  });

  const text = `Hello ${params.recipientName},\n\nThe appointment with ${params.otherPartyName} on ${params.date} at ${params.time} has been cancelled.\n\nReason: ${params.reason || 'None specified'}\n\nBook another slot:\n${params.rebookUrl || 'https://curalink.health/find-doctor'}`;

  return { subject, html, text };
}

/**
 * 5. Appointment Rescheduled
 */
export function appointmentRescheduledTemplate(params: {
  recipientName: string;
  otherPartyName: string;
  isDoctor: boolean;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  timezone?: string;
  mode: string;
  detailsUrl: string;
}): EmailRenderOutput {
  const safeRecipient = escapeHtml(params.recipientName);
  const safeOther = escapeHtml(params.otherPartyName);
  const subject = `Appointment Rescheduled: New Time on ${escapeHtml(params.newDate)}`;

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Appointment Rescheduled
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Hello ${safeRecipient}, your consultation with <strong>${params.isDoctor ? '' : 'Dr. '}${safeOther}</strong> has been updated to a new time.
    </p>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; margin: 20px 0;">
      <tr>
        <td style="padding: 16px 20px; font-size: 14px; color: #475569; line-height: 22px;">
          <span style="color: #94A3B8; text-decoration: line-through;">Previous: ${escapeHtml(params.oldDate)} at ${escapeHtml(params.oldTime)}</span><br/>
          <strong style="color: #0F172A; font-size: 16px;">New Schedule: ${escapeHtml(params.newDate)} at ${escapeHtml(params.newTime)} (${escapeHtml(params.timezone || 'Local Time')})</strong>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${params.detailsUrl}" style="display: inline-block; background-color: #0D9488; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
        View Updated Schedule
      </a>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Your appointment with ${params.otherPartyName} has been rescheduled to ${params.newDate} at ${params.newTime}`,
    title: subject,
    contentHtml,
  });

  const text = `Hello ${params.recipientName},\n\nYour appointment with ${params.otherPartyName} has been rescheduled.\n\nNew Date: ${params.newDate}\nNew Time: ${params.newTime}\n\nView details:\n${params.detailsUrl}`;

  return { subject, html, text };
}

/**
 * 6. Upcoming Appointment Reminder
 */
export function appointmentReminderTemplate(params: {
  recipientName: string;
  otherPartyName: string;
  isDoctor: boolean;
  date: string;
  time: string;
  timezone?: string;
  mode: string;
  hoursUntil: number;
  detailsUrl: string;
  videoInstructions?: boolean;
}): EmailRenderOutput {
  const safeRecipient = escapeHtml(params.recipientName);
  const safeOther = escapeHtml(params.otherPartyName);
  const safeDate = escapeHtml(params.date);
  const safeTime = escapeHtml(params.time);
  const hours = params.hoursUntil || 1;
  const isVideo = params.mode?.toUpperCase() === 'VIDEO' || params.videoInstructions;
  const subject = `Reminder: Consultation with ${params.isDoctor ? '' : 'Dr. '}${safeOther} in ${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Upcoming Consultation Reminder
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Hello ${safeRecipient}, this is a reminder that your appointment with <strong>${params.isDoctor ? '' : 'Dr. '}${safeOther}</strong> is scheduled in approximately <strong>${hours} ${hours === 1 ? 'hour' : 'hours'}</strong>.
    </p>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px 22px; margin: 20px 0; border-left: 4px solid #0D9488;">
      <h3 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #0F172A;">Consultation Overview</h3>
      <p style="margin: 0; font-size: 14px; color: #475569; line-height: 22px;">
        &bull; <strong>Scheduled Date:</strong> ${safeDate}<br/>
        &bull; <strong>Scheduled Time:</strong> ${safeTime} (${escapeHtml(params.timezone || 'Local Time')})<br/>
        &bull; <strong>Mode:</strong> ${isVideo ? '🎥 Secure Video Telehealth' : '🏥 In-Person Consultation'}
      </p>
    </div>

    ${isVideo ? `
    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #1E40AF; line-height: 20px;">
      <strong>Pre-consultation checklist:</strong><br/>
      1. Ensure you are in a quiet, private area.<br/>
      2. Check your internet connection, camera, and microphone.<br/>
      3. Join 5 minutes before scheduled start time.
    </div>
    ` : ''}

    <div style="text-align: center; margin: 28px 0;">
      <a href="${params.detailsUrl}" style="display: inline-block; background-color: #0D9488; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">
        Open Consultation Room
      </a>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Reminder: Consultation with ${params.otherPartyName} is in ${hours} hours on ${params.date} at ${params.time}`,
    title: subject,
    contentHtml,
  });

  const text = `Hello ${params.recipientName},\n\nReminder: Your appointment with ${params.otherPartyName} is in ${hours} hours.\n\nDate: ${params.date}\nTime: ${params.time}\nMode: ${params.mode}\n\nJoin room:\n${params.detailsUrl}`;

  return { subject, html, text };
}
