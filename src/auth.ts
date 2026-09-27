import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from '@/auth.config'
import { userStorage } from '@/lib/auth/user-storage'
import { resolveAuthSecret } from '@/lib/auth/secret'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        const email = String(credentials.email).trim().toLowerCase()
        const password = String(credentials.password || '')

        const user = await userStorage.findByEmail(email)
        if (!user) {
          throw new Error('No account found with this email.')
        }

        if (!userStorage.verifyPassword(password, user.passwordHash)) {
          throw new Error('Invalid email or password.')
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
  secret: resolveAuthSecret(),
})
