import { NextResponse } from 'next/server'
import { userStorage } from '@/lib/auth/user-storage'
import { sendOtpEmail } from '@/lib/email/send-otp'

/**
 * Issues a verification code for a new account.
 *
 * Codes are generated and stored by this application (see `userStorage.generateOtp`),
 * never delegated to an external identity provider. Their only purpose is to confirm
 * that whoever is signing up can receive mail at that address — signing in does not
 * use a code.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    const cooldown = await userStorage.otpResendCooldown(normalizedEmail)
    if (cooldown > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${cooldown} second${cooldown === 1 ? '' : 's'} before requesting another code.`,
        },
        { status: 429 }
      )
    }

    const existing = await userStorage.findByEmail(normalizedEmail)
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const otp = await userStorage.generateOtp(normalizedEmail)
    const emailResult = await sendOtpEmail({
      to: normalizedEmail,
      otp,
      name: body.name || 'User',
      expiresInMinutes: 10,
    })

    // Do not claim the code was sent if it never left the server, and release
    // the stored code so the user is not blocked by the resend cooldown.
    if (!emailResult.success) {
      await userStorage.clearOtp(normalizedEmail)
      return NextResponse.json(
        {
          success: false,
          message: emailResult.error || 'Failed to send the verification code. Please try again.',
          emailSent: false,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email.',
      emailSent: true,
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to send OTP.'
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 })
  }
}
