import { getAppUrl } from '../resend';

export interface NewsletterEmailData {
  subject: string;
  headline: string;
  previewText?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  subscriberEmail: string;
  subscriberName?: string;
  unsubscribeToken?: string;
}

export function generateNewsletterEmailHtml(data: NewsletterEmailData): string {
  const appUrl = getAppUrl();
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(data.subscriberEmail)}${data.unsubscribeToken ? `&token=${encodeURIComponent(data.unsubscribeToken)}` : ''}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject} - JVican Vote Arena</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050507; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(180deg, #111116 0%, #0c0c10 100%); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Header Accent -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #6366f1 100%);"></td>
          </tr>

          <!-- Header / Logo -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center;">
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: inline-block; text-align: center; line-height: 38px; color: #000; font-weight: 900; font-size: 20px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                      J
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; display: block;">
                      JVICAN <span style="background: linear-gradient(90deg, #10b981, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #10b981;">ARENA</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Newsletter Tag -->
          <tr>
            <td style="padding: 0 40px 16px; text-align: center;">
              <div style="display: inline-block; padding: 4px 14px; border-radius: 9999px; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); color: #34d399; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                COMMUNITY & EVENT SPOTLIGHT
              </div>
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td style="padding: 0 40px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.3;">
                ${data.headline}
              </h1>
              ${data.subscriberName ? `
              <p style="margin: 12px 0 0; font-size: 14px; color: #9ca3af;">
                Hello ${data.subscriberName},
              </p>
              ` : ''}
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 0 40px 32px; font-size: 15px; line-height: 1.7; color: #d1d5db;">
              <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 14px; padding: 28px;">
                ${data.contentHtml}
              </div>
            </td>
          </tr>

          <!-- CTA Button (Optional) -->
          ${data.ctaText && data.ctaUrl ? `
          <tr>
            <td style="padding: 0 40px 36px; text-align: center;">
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                    <a href="${data.ctaUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #000000; text-decoration: none; border-radius: 12px; letter-spacing: 0.3px;">
                      ${data.ctaText} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.06);"></div>
            </td>
          </tr>

          <!-- Footer & Unsubscribe -->
          <tr>
            <td style="padding: 24px 40px 36px; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 12px; color: #6b7280; line-height: 1.6;">
                You received this email because you opted into updates from JVican Vote Arena.
              </p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #9ca3af;">
                Want to change how you receive these emails? 
                <a href="${unsubscribeUrl}" style="color: #10b981; text-decoration: underline; font-weight: 500;">
                  Unsubscribe here
                </a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #4b5563;">
                © ${new Date().getFullYear()} JVican Vote Arena. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
