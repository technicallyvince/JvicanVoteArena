import { NextResponse } from 'next/server'
import { userStorage } from '@/lib/auth/user-storage'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, otp } = body

    if (!name || !email || !password || !otp) {
      return NextResponse.json(
        { success: false, message: 'All fields including OTP are required.' },
        { status: 400 }
      )
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    // Verify OTP first
    const otpResult = await userStorage.verifyOtp(normalizedEmail, String(otp))
    if (!otpResult.valid) {
      return NextResponse.json({ success: false, message: otpResult.message }, { status: 400 })
    }

    // Create the account in Supabase
    const newUser = await userStorage.createUser({
      name: String(name),
      email: normalizedEmail,
      password: String(password),
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Registration failed.'
    return NextResponse.json({ success: false, message: errorMsg }, { status: 400 })
  }
}
