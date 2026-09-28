export interface BaseTemplateProps {
  preheader?: string;
  title: string;
  contentHtml: string;
  footerText?: string;
}

export function renderBaseEmailTemplate({
  preheader = 'CuraLink Healthcare notification',
  title,
  contentHtml,
  footerText = 'This is an automated notification regarding your CuraLink healthcare account. Please do not reply directly to this email.',
}: BaseTemplateProps): string {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; color: #1E293B;">
  <!-- Preheader text for inbox previews -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; max-width: 0px; opacity: 0; mso-hide: all;">
    ${preheader}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- Container card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0F172A; padding: 28px 32px; border-bottom: 3px solid #0D9488;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #0D9488; border-radius: 8px; width: 32px; height: 32px; text-align: center; vertical-align: middle; color: #FFFFFF; font-weight: 800; font-size: 18px; line-height: 32px;">
                          +
                        </td>
                        <td style="padding-left: 12px; font-size: 22px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">
                          Cura<span style="color: #2DD4BF;">Link</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                    Healthcare Platform
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Security Callout & Help Banner -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #475569; line-height: 20px;">
                <strong style="color: #0F172A;">Need clinical assistance?</strong> If this is a medical emergency, dial emergency services immediately (911 / 112). For platform support, visit <a href="https://curalink.health/help" style="color: #0D9488; text-decoration: none; font-weight: 600;">curalink.health/help</a>.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 24px 32px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B; line-height: 18px; text-align: center;">
              <p style="margin: 0 0 8px 0;">${footerText}</p>
              <p style="margin: 0 0 12px 0;">
                <a href="https://curalink.health/privacy-policy" style="color: #0D9488; text-decoration: underline;">Privacy Policy</a> &bull;
                <a href="https://curalink.health/terms-of-service" style="color: #0D9488; text-decoration: underline;">Terms of Service</a> &bull;
                <a href="https://curalink.health/cancellation-policy" style="color: #0D9488; text-decoration: underline;">Cancellation Policy</a>
              </p>
              <p style="margin: 0; color: #94A3B8;">&copy; ${currentYear} CuraLink Healthcare Telehealth Network. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
