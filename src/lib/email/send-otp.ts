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

  return await sendEmail({
    type: 'OTP',
    to,
    from: EMAIL_FROM_NOTIFICATIONS,
    subject: `Your Login Verification Code [${otp}] - JVican Vote Arena`,
    html,
  })
}
