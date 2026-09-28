import { renderBaseEmailTemplate } from './base.template';
import { escapeHtml } from './escape-html';

export interface EmailRenderOutput {
  subject: string;
  html: string;
  text: string;
}

/**
 * 1. Email Verification Template
 */
export function verificationEmailTemplate(params: {
  name: string;
  verifyUrl: string;
  expiresMinutes?: number;
}): EmailRenderOutput {
  const safeName = escapeHtml(params.name);
  const minutes = params.expiresMinutes || 30;
  const subject = 'Verify your CuraLink Healthcare account';

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Welcome to CuraLink, ${safeName}
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Thank you for creating an account with CuraLink. To protect your medical privacy and ensure secure access to telehealth consultations, prescriptions, and medical records, please verify your email address.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${params.verifyUrl}" style="display: inline-block; background-color: #0D9488; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.25);">
        Verify Email Address
      </a>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748B; line-height: 20px;">
      This verification link is single-use and will expire in <strong>${minutes} minutes</strong>. If you did not create a CuraLink account, please disregard this email.
    </p>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; margin-top: 24px;">
      <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748B;">Button not working? Copy and paste this URL into your browser:</p>
      <p style="margin: 0; font-size: 12px; color: #0D9488; word-break: break-all; font-family: monospace;">
        ${params.verifyUrl}
      </p>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Verify your CuraLink account to access telehealth services`,
    title: subject,
    contentHtml,
  });

  const text = `Welcome to CuraLink, ${params.name}!\n\nPlease verify your email address to access telehealth consultations and medical records.\n\nClick the link below to verify your email (expires in ${minutes} minutes):\n${params.verifyUrl}\n\nIf you did not register for CuraLink, you can safely ignore this email.`;

  return { subject, html, text };
}

/**
 * 2. Patient Welcome Template
 */
export function patientWelcomeTemplate(params: {
  name: string;
  loginUrl: string;
  profileUrl: string;
}): EmailRenderOutput {
  const safeName = escapeHtml(params.name);
  const subject = 'Welcome to CuraLink Healthcare Network';

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Your healthcare portal is ready, ${safeName}
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Your email address has been verified. You now have full access to licensed board-certified specialists, AI-assisted clinical symptom triage, real-time vitals tracking, and end-to-end encrypted video consultations.
    </p>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
      <tr>
        <td style="padding: 18px 20px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">Next steps to optimize your care:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 22px;">
            <li>Complete your patient profile with emergency contact details.</li>
            <li>Explore licensed specialists across cardiology, pediatrics, general medicine, and dermatology.</li>
            <li>Use the clinical Symptom Checker before your first appointment for guided triage.</li>
          </ul>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${params.loginUrl}" style="display: inline-block; background-color: #0D9488; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.25);">
        Open Your Patient Dashboard
      </a>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Welcome to CuraLink Healthcare Network - Your account is verified`,
    title: subject,
    contentHtml,
  });

  const text = `Welcome to CuraLink, ${params.name}!\n\nYour account is now active and verified. You have access to licensed doctors, clinical triage, and telehealth appointments.\n\nLog in to your patient dashboard:\n${params.loginUrl}`;

  return { subject, html, text };
}

/**
 * 3. Password Reset Request Template
 */
export function passwordResetTemplate(params: {
  name: string;
  resetUrl: string;
  expiresMinutes?: number;
}): EmailRenderOutput {
  const safeName = escapeHtml(params.name);
  const minutes = params.expiresMinutes || 15;
  const subject = 'CuraLink Password Reset Request';

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Password Reset Request
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Hello ${safeName}, we received a request to reset the password for your CuraLink account.
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #334155; line-height: 24px;">
      To choose a new password, click the secure button below. This link is single-use and will expire in <strong>${minutes} minutes</strong>.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${params.resetUrl}" style="display: inline-block; background-color: #0D9488; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.25);">
        Reset Password
      </a>
    </div>

    <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 14px 18px; margin: 24px 0; font-size: 13px; color: #991B1B; line-height: 20px;">
      <strong>Security notice:</strong> If you did not request this password reset, please ignore this email or contact support. Your password will remain unchanged, and your active sessions remain secure.
    </div>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; margin-top: 16px;">
      <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748B;">Or copy and paste this URL into your browser:</p>
      <p style="margin: 0; font-size: 12px; color: #0D9488; word-break: break-all; font-family: monospace;">
        ${params.resetUrl}
      </p>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Instructions to reset your CuraLink account password`,
    title: subject,
    contentHtml,
  });

  const text = `Hello ${params.name},\n\nWe received a request to reset the password for your CuraLink account.\n\nUse this single-use link to reset your password (expires in ${minutes} minutes):\n${params.resetUrl}\n\nIf you did not request this change, please ignore this email.`;

  return { subject, html, text };
}

/**
 * 4. Password Changed Security Notification
 */
export function passwordChangedTemplate(params: {
  name: string;
  time?: string;
  ipAddress?: string;
  supportUrl?: string;
}): EmailRenderOutput {
  const safeName = escapeHtml(params.name);
  const timeStr = params.time || new Date().toUTCString();
  const safeIp = params.ipAddress ? escapeHtml(params.ipAddress) : 'Authorized browser session';
  const supportLink = params.supportUrl || 'https://curalink.health/help';
  const subject = 'Security Alert: Your CuraLink Password Was Changed';

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Password Successfully Changed
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Hello ${safeName}, this is a confirmation that the password for your CuraLink account was updated on <strong>${timeStr}</strong>.
    </p>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
      <tr>
        <td style="padding: 14px 18px; font-size: 13px; color: #475569; line-height: 20px;">
          <strong>Security details:</strong><br/>
          &bull; Activity: Password Update<br/>
          &bull; Source IP: ${safeIp}<br/>
          &bull; Active Sessions: All previous login tokens have been invalidated for security.
        </td>
      </tr>
    </table>

    <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 14px 18px; margin: 24px 0; font-size: 13px; color: #92400E; line-height: 20px;">
      <strong>Did not make this change?</strong> If you did not update your password, your account may be compromised. Please <a href="${supportLink}" style="color: #92400E; text-decoration: underline; font-weight: 700;">contact our security team immediately</a> to lock your account and secure your clinical records.
    </div>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Security Alert: Your CuraLink password was updated`,
    title: subject,
    contentHtml,
  });

  const text = `Hello ${params.name},\n\nYour CuraLink account password was successfully updated on ${timeStr}.\n\nSource IP: ${params.ipAddress || 'Authorized session'}\n\nIf you did not perform this change, contact CuraLink Support immediately at ${supportLink}.`;

  return { subject, html, text };
}
