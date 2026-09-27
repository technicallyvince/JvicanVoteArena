import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = (auth?.user as any)?.role || 'organizer'
      const pathname = nextUrl.pathname

      const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
      const isAdminRoute = pathname.startsWith('/admin')
      const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')

      if (isProtected && !isLoggedIn) {
        return false // Redirects automatically to signIn page
      }

      if (isAdminRoute && isLoggedIn && role !== 'admin') {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      if (isAuthRoute && isLoggedIn) {
        const target = role === 'admin' ? '/admin' : '/dashboard'
        return Response.redirect(new URL(target, nextUrl))
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'organizer'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role as 'organizer' | 'admin'
      }
      return session
    },
  },
  providers: [], // Configured with credentials in auth.ts (Node runtime)
} satisfies NextAuthConfig
