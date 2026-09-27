import { NextResponse } from 'next/server'
import { userStorage } from '@/lib/auth/user-storage'
import { sendOtpEmail } from '@/lib/email/send-otp'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, type = 'login' } = body

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    if (type === 'login') {
      const user = userStorage.findByEmail(normalizedEmail)
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'No account found with this email address.' },
          { status: 404 }
        )
      }

      if (password) {
        const isPasswordValid = userStorage.verifyPassword(password, user.passwordHash)
        if (!isPasswordValid) {
          return NextResponse.json(
            { success: false, message: 'Invalid password. Please check and try again.' },
            { status: 401 }
          )
        }
      }

      const otp = userStorage.generateOtp(normalizedEmail, 10)
      
      // Dispatch OTP Email
      const emailResult = await sendOtpEmail({
        to: normalizedEmail,
        otp,
        name: user.name,
        expiresInMinutes: 10,
      })

      return NextResponse.json({
        success: true,
        message: 'A 6-digit verification code has been sent to your email.',
        emailSent: emailResult.success,
        // In local development if email is mock, provide helpful hint
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
      })
    } else if (type === 'signup') {
      const userExists = userStorage.findByEmail(normalizedEmail)
      if (userExists) {
        return NextResponse.json(
          { success: false, message: 'An account with this email already exists.' },
          { status: 409 }
        )
      }

      const otp = userStorage.generateOtp(normalizedEmail, 10)
      const emailResult = await sendOtpEmail({
        to: normalizedEmail,
        otp,
        name: body.name || 'User',
        expiresInMinutes: 10,
      })

      return NextResponse.json({
        success: true,
        message: 'A 6-digit verification code has been sent to your email.',
        emailSent: emailResult.success,
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid request type' }, { status: 400 })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to send OTP.'
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 })
  }
}
