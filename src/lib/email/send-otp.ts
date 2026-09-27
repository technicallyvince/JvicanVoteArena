import { sendEmail, EMAIL_FROM_NOTIFICATIONS } from './resend'
import { generateOtpEmailHtml } from './templates/otp-email'

export interface SendOtpEmailParams {
  to: string
  otp: string
  name?: string
  expiresInMinutes?: number
}

export async function sendOtpEmail(params: SendOtpEmailParams) {
  const { to, otp, name, expiresInMinutes = 10 } = params

  if (!to) {
    return { success: false, error: 'Recipient email is required' }
  }

  const html = generateOtpEmailHtml({
    email: to,
    otp,
    name,
    expiresInMinutes,
  })

  const result = await sendEmail({
    type: 'OTP',
    to,
    from: EMAIL_FROM_NOTIFICATIONS,
    subject: `Your Login Verification Code [${otp}] - JVican Vote Arena`,
    html,
  })

  // No provider is configured, so the code was only written to the server log.
  // Reporting success here would tell the user to check an inbox that will
  // never receive anything.
  if (result.simulated) {
    return {
      success: false,
      simulated: true,
      error:
        'Email delivery is not configured on this server, so the code was not sent. Set RESEND_API_KEY (or BREVO_API_KEY) in the deployment environment.',
    }
  }

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'The email provider rejected the message.',
    }
  }

  return { success: true, provider: result.provider, messageId: result.messageId }
}
