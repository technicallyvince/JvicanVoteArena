import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from '@/auth.config'
import { userStorage } from '@/lib/auth/user-storage'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        const email = String(credentials.email).trim().toLowerCase()
        const password = String(credentials.password || '')
        const otp = credentials.otp ? String(credentials.otp).trim() : ''

        const user = userStorage.findByEmail(email)
        if (!user) {
          throw new Error('No account found with this email.')
        }

        // Verify password
        const isPasswordValid = userStorage.verifyPassword(password, user.passwordHash)
        if (!isPasswordValid) {
          throw new Error('Invalid email or password.')
        }

        // Verify OTP
        if (!otp) {
          throw new Error('OTP_REQUIRED')
        }

        const otpCheck = userStorage.verifyOtp(email, otp)
        if (!otpCheck.valid) {
          throw new Error(otpCheck.message)
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'jvican_votearena_auth_secret_production_key_2026_secure',
})
