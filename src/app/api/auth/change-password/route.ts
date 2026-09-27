import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { userStorage } from '@/lib/auth/user-storage'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { oldPassword, newPassword } = await req.json()
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    const user = await userStorage.findByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // The old password is mandatory. Without this check any live session could
    // take the account over, including on a shared or borrowed device.
    if (!oldPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password is required.' },
        { status: 400 }
      )
    }

    const isValid = userStorage.verifyPassword(oldPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect.' },
        { status: 400 }
      )
    }

    await userStorage.updatePassword(session.user.email, newPassword)

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully!',
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update password.'
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 })
  }
}
