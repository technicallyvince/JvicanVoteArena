import { NextRequest, NextResponse } from 'next/server';
import { isBrevoConfigured, sendBrevoEmail, parseEmailSender } from '@/lib/email/brevo';
import { EMAIL_FROM_NOTIFICATIONS } from '@/lib/email/resend';

/**
 * Development & Admin Test Endpoint for Brevo transactional email delivery.
 *
 * Requirements:
 * - Allows testing Brevo once BREVO_API_KEY is configured.
 * - Does NOT create a vote, payment, receipt, or modify production data.
 * - Does NOT subscribe anyone to the newsletter.
 * - Clearly marked as a development/admin diagnostic tool.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { toEmail, testSubject, customSender } = body;

    if (!toEmail || typeof toEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid recipient email address (toEmail).',
        },
        { status: 400 }
      );
    }

    const configured = isBrevoConfigured();
    if (!configured) {
      return NextResponse.json(
        {
          success: false,
          brevoConfigured: false,
          error:
            'BREVO_API_KEY is not configured in the environment. Please add BREVO_API_KEY to your .env.local or production variables.',
          diagnostic: {
            hasApiKey: false,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 503 }
      );
    }

    const senderStr = customSender || EMAIL_FROM_NOTIFICATIONS;
    const sender = parseEmailSender(senderStr);
    const subject = testSubject || `[Diagnostic Test] Brevo Provider Verification - JVican Vote Arena`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Brevo Integration Test</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #050608; color: #e2e8f0; margin: 0; padding: 30px 10px; }
    .card { max-width: 540px; margin: 0 auto; background-color: #0b0c12; border: 1px solid rgba(201,168,76,0.3); border-radius: 16px; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
    .gold-pill { display: inline-block; padding: 4px 12px; background-color: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.4); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #D4B86A; margin-bottom: 12px; text-transform: uppercase; }
    h1 { font-size: 20px; font-weight: 900; color: #ffffff; margin: 0 0 12px 0; }
    p { font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px 0; }
    .badge-success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.35); color: #34d399; font-weight: 700; padding: 8px 14px; border-radius: 8px; font-size: 12px; margin-bottom: 16px; }
    .details-box { background: #11131a; border-radius: 10px; padding: 14px; font-family: monospace; font-size: 11px; color: #cbd5e1; line-height: 1.6; margin-bottom: 18px; }
    .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="gold-pill">Diagnostic Verification</div>
    <h1>Brevo Provider Connected Successfully</h1>
    <div class="badge-success">✓ BrevoClient SDK is active and transactional email was accepted.</div>
    <p>
      This is a development/admin diagnostic test email sent via <strong>Brevo (Sendinblue)</strong> to verify that your API credentials and sender domain are configured properly.
    </p>
    <div class="details-box">
      <strong>Recipient:</strong> ${toEmail}<br>
      <strong>Sender:</strong> ${sender.email} (${sender.name || 'JVican'})<br>
      <strong>Dispatched At:</strong> ${new Date().toISOString()}<br>
      <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}
    </div>
    <div class="footer">
      JVican Vote Arena • Email Engine System Diagnostic
    </div>
  </div>
</body>
</html>
    `.trim();

    const result = await sendBrevoEmail({
      sender,
      to: [{ email: toEmail.trim() }],
      subject,
      htmlContent,
      textContent: `Brevo Provider Diagnostic Verification: BrevoClient is active and received this test message. Dispatched at: ${new Date().toISOString()}`,
      tags: ['diagnostic-test', 'admin-test'],
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          brevoConfigured: true,
          provider: 'brevo',
          error: result.error,
          statusCode: result.statusCode,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      brevoConfigured: true,
      provider: 'brevo',
      messageId: result.providerMessageId,
      recipient: toEmail,
      note: 'Test email successfully dispatched through BrevoClient SDK.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[API ADMIN TEST BREVO ERROR]', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Unexpected server error while testing Brevo.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const configured = isBrevoConfigured();

  return NextResponse.json({
    service: 'Brevo (Sendinblue) Email Provider',
    status: configured ? 'CONFIGURED' : 'UNCONFIGURED',
    isBrevoConfigured: configured,
    primaryProvider: process.env.EMAIL_PRIMARY_PROVIDER || 'resend',
    fallbackProvider: process.env.EMAIL_FALLBACK_PROVIDER || 'brevo',
    fallbackEnabled: process.env.EMAIL_ENABLE_FALLBACK !== 'false',
    instructions: configured
      ? 'Brevo API key is detected. Send a POST request with { "toEmail": "your-email@example.com" } to test delivery.'
      : 'Brevo is not configured yet. Add BREVO_API_KEY to .env.local to activate.',
    timestamp: new Date().toISOString(),
  });
}
