import { renderBaseEmailTemplate } from './base.template';
import { escapeHtml } from './escape-html';
import { EmailRenderOutput } from './auth.templates';

/**
 * 1. Doctor Registration Received (Pending Verification)
 */
export function doctorRegistrationReceivedTemplate(params: {
  name: string;
  specialization?: string;
  medicalLicenseNumber?: string;
}): EmailRenderOutput {
  const safeName = escapeHtml(params.name);
  const safeSpec = escapeHtml(params.specialization || 'General Practice');
  const safeLicense = escapeHtml(params.medicalLicenseNumber || 'PENDING');
  const subject = 'CuraLink Practitioner Registration Received — Verification Pending';

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Welcome to CuraLink, Dr. ${safeName}
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Thank you for registering as a healthcare provider with the CuraLink Telehealth Network.
    </p>

    <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 10px; padding: 16px 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #92400E;">
        ⚠️ Clinical Verification Status: PENDING
      </h3>
      <p style="margin: 0; font-size: 14px; color: #78350F; line-height: 20px;">
        To ensure patient safety and uphold clinical governance, all medical licenses are independently audited by our clinical credentialing board prior to profile activation.
      </p>
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; margin: 20px 0;">
      <tr>
        <td style="padding: 16px 20px; font-size: 14px; color: #475569; line-height: 22px;">
          <strong style="color: #0F172A;">Registration Summary:</strong><br/>
          &bull; Practitioner Name: Dr. ${safeName}<br/>
          &bull; Declared Specialty: ${safeSpec}<br/>
          &bull; License Number: ${safeLicense}<br/>
          &bull; Next Step: Credential audit (typically 24–48 hours)
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748B; line-height: 22px;">
      While verification is pending, your profile will remain hidden from the patient discovery directory. Once approved, you will receive an email confirmation and can begin accepting consultations.
    </p>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Dr. ${params.name}, your CuraLink provider registration has been received and is under clinical review`,
    title: subject,
    contentHtml,
  });

  const text = `Welcome Dr. ${params.name},\n\nYour practitioner registration on CuraLink has been received. Your medical verification is currently PENDING review by our clinical credentials committee.\n\nDeclared Specialty: ${params.specialization || 'General Practice'}\nLicense: ${params.medicalLicenseNumber || 'PENDING'}\n\nYou will be notified via email as soon as an administrator verifies your credentials.`;

  return { subject, html, text };
}

/**
 * 2. Doctor Verification Approved
 */
export function doctorVerificationApprovedTemplate(params: {
  name: string;
  dashboardUrl: string;
}): EmailRenderOutput {
  const safeName = escapeHtml(params.name);
  const subject = 'Congratulations! Your CuraLink Medical Credentials Have Been Verified';

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Medical Credentials Approved, Dr. ${safeName}
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Our credentialing administration has completed verification of your medical license and professional credentials.
    </p>

    <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; padding: 16px 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #065F46;">
        ✅ Verified Practitioner Status: ACTIVE
      </h3>
      <p style="margin: 0; font-size: 14px; color: #047857; line-height: 20px;">
        Your verified badge is now active. Your profile is publicly discoverable in the CuraLink doctor directory, and patients can schedule consultations with you.
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${params.dashboardUrl}" style="display: inline-block; background-color: #0D9488; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.25);">
        Open Doctor Dashboard
      </a>
    </div>

    <p style="margin: 0; font-size: 14px; color: #475569; line-height: 22px;">
      You can now configure your consultation fees, weekly availability slots, and tele-consultation room preferences under Settings.
    </p>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Dr. ${params.name}, your medical credentials have been approved on CuraLink`,
    title: subject,
    contentHtml,
  });

  const text = `Dr. ${params.name},\n\nCongratulations! Your medical credentials have been verified by the CuraLink Credentialing Committee.\n\nYour profile is now live in the doctor directory and accepting appointments.\n\nOpen your Doctor Dashboard:\n${params.dashboardUrl}`;

  return { subject, html, text };
}

/**
 * 3. Doctor Verification Rejected
 */
export function doctorVerificationRejectedTemplate(params: {
  name: string;
  reason?: string;
  supportUrl?: string;
}): EmailRenderOutput {
  const safeName = escapeHtml(params.name);
  const safeReason = escapeHtml(params.reason || 'Medical council registry records could not be validated or license documents were incomplete.');
  const supportLink = params.supportUrl || 'https://curalink.health/help';
  const subject = 'Important: Update Regarding Your CuraLink Practitioner Verification';

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 28px;">
      Practitioner Verification Update
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 24px;">
      Dear Dr. ${safeName}, our credentialing team has reviewed the medical licensing information submitted for your account.
    </p>

    <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 10px; padding: 16px 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #991B1B;">
        Status: Credential Verification Not Approved
      </h3>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #7F1D1D; line-height: 20px;">
        <strong>Reason provided by credentialing committee:</strong>
      </p>
      <p style="margin: 0; font-size: 14px; color: #991B1B; line-height: 20px; font-style: italic;">
        "${safeReason}"
      </p>
    </div>

    <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 22px;">
      If you believe this is in error, or if you hold updated licensing documentation, you may resubmit your credentials or contact our clinical compliance desk.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${supportLink}" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
        Contact Credentialing Desk
      </a>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    preheader: `Update regarding your CuraLink medical credential verification`,
    title: subject,
    contentHtml,
  });

  const text = `Dear Dr. ${params.name},\n\nYour practitioner verification could not be approved at this time.\n\nReason: ${params.reason || 'Verification could not be validated'}\n\nPlease contact our credentialing desk at ${supportLink} to provide updated documentation.`;

  return { subject, html, text };
}
