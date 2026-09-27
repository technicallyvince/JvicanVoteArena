/**
 * Create or reset a super admin account in Supabase.
 *
 * Usage:
 *   node scripts/create_super_admin.mts [email] [--role admin|organizer]
 *
 * The password is never hardcoded. Resolution order:
 *   1. SUPER_ADMIN_PASSWORD env var
 *   2. Interactive hidden prompt (when a TTY is attached)
 *   3. A strong random password, printed once
 *
 * Re-running for an existing address resets its password. The role defaults to
 * admin, so an account that was created as an organizer can be promoted.
 * Pass --role organizer to grant a password to an existing organizer without
 * also handing them admin rights, which is what granting a password to an
 * account that predates the migration usually needs.
 *
 * Accounts live in Supabase, so this reaches the same database as the deployed
 * app. That also makes it the way to grant a password to an account that
 * predates the migration and so has none.
 */

import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// Load .env.local before the store is imported, so getSupabaseAdmin() sees the
// project URL and service role key. Absent is fine when the environment is
// already populated, for example in CI.
try {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  process.loadEnvFile(path.join(projectRoot, '.env.local'))
} catch {
  // No .env.local here; rely on the ambient environment.
}

const { userStorage } = await import('../src/lib/auth/user-storage.ts')

const DEFAULT_EMAIL = 'admin@jvican.com'
const DEFAULT_NAME = 'JVican Super Admin'
const MIN_PASSWORD_LENGTH = 12
const ROLES = ['admin', 'organizer'] as const
type Role = (typeof ROLES)[number]

/**
 * Splits argv into the positional email and an optional --role flag.
 * `--role` accepts both `--role admin` and `--role=admin`.
 */
function parseArgs(argv: string[]): { email?: string; role: Role } {
  let email: string | undefined
  let role: Role = 'admin'

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === '--role' || arg === '-r') {
      const value = argv[++i]
      if (!value) throw new Error('--role needs a value: admin or organizer')
      if (!ROLES.includes(value as Role)) {
        throw new Error(`--role must be one of: ${ROLES.join(', ')} (got "${value}")`)
      }
      role = value as Role
      continue
    }

    if (arg.startsWith('--role=')) {
      const value = arg.slice('--role='.length)
      if (!ROLES.includes(value as Role)) {
        throw new Error(`--role must be one of: ${ROLES.join(', ')} (got "${value}")`)
      }
      role = value as Role
      continue
    }

    if (arg === '--help' || arg === '-h') {
      console.log(
        [
          'Usage:',
          '  npm run superadmin -- [email] [--role admin|organizer]',
          '',
          'Grants or resets a password for an account.',
          '',
          '  --role admin       (default) create or promote to a super admin',
          '  --role organizer   set the password but keep organizer rights',
          '',
          'Examples:',
          '  npm run superadmin',
          '  npm run superadmin someone@example.com',
          '  npm run superadmin someone@example.com --role organizer',
        ].join('\n')
      )
      process.exit(0)
    }

    if (email === undefined) email = arg
  }

  return { email, role }
}

/** Reads a line from stdin without echoing it. Requires a TTY. */
function readHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin
    process.stdout.write(question)

    const wasRaw = stdin.isRaw
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    let value = ''

    const cleanup = () => {
      stdin.removeListener('data', onData)
      stdin.setRawMode(wasRaw ?? false)
      stdin.pause()
      process.stdout.write('\n')
    }

    const onData = (chunk: string) => {
      for (const ch of chunk) {
        switch (ch) {
          case '\r':
          case '\n':
          case '\u0004':
            cleanup()
            resolve(value)
            return
          case '\u0003':
            cleanup()
            reject(new Error('Cancelled'))
            return
          case '\u007f':
          case '\b':
            if (value.length > 0) value = value.slice(0, -1)
            break
          default:
            // Ignore control characters, accept printable input.
            if (ch >= ' ') value += ch
            break
        }
      }
    }

    stdin.on('data', onData)
  })
}

function generatePassword(): string {
  // 24 chars from an unambiguous alphabet, guaranteed to satisfy the length rule.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#%'
  const bytes = randomBytes(48)
  let out = ''
  for (let i = 0; i < 24; i++) {
    out += alphabet[bytes[i] % alphabet.length]
  }
  return out
}

function validatePassword(pw: string): string | null {
  if (pw.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters (got ${pw.length}).`
  }
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) {
    return 'Password must contain at least one letter and one number.'
  }
  return null
}

async function main() {
  const { email: argEmail, role } = parseArgs(process.argv.slice(2))
  const email = (argEmail || process.env.SUPER_ADMIN_EMAIL || DEFAULT_EMAIL).trim().toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`Not a valid email address: ${email}`)
    process.exit(1)
  }

  const name = (process.env.SUPER_ADMIN_NAME || DEFAULT_NAME).trim()

  let password = process.env.SUPER_ADMIN_PASSWORD || ''
  let passwordSource: 'env' | 'prompt' | 'generated' = 'env'

  if (!password) {
    if (process.stdin.isTTY) {
      password = await readHidden(`Password for ${email}: `)
      passwordSource = 'prompt'
    } else {
      password = generatePassword()
      passwordSource = 'generated'
    }
  }

  const problem = validatePassword(password)
  if (problem) {
    console.error(problem)
    process.exit(1)
  }

  const existing = await userStorage.findByEmail(email)
  const user = await userStorage.upsertAdmin({ name, email, password, role })

  console.log('')
  console.log(
    existing
      ? role === 'admin'
        ? 'Super admin reset'
        : 'Password set'
      : role === 'admin'
        ? 'Super admin created'
        : 'Organizer account created'
  )
  console.log('-------------------------------')
  console.log(`  Email:  ${user.email}`)
  console.log(`  Name:   ${user.name}`)
  console.log(`  Role:   ${user.role}`)
  console.log(`  User ID: ${user.id}`)

  if (existing && role === 'admin' && existing.role !== 'admin') {
    console.log('')
    console.log(`  ^ Promoted from ${existing.role} to admin.`)
  }

  if (passwordSource === 'generated') {
    console.log(`  Password: ${password}`)
    console.log('')
    console.log('  ^ Shown once because it was generated. Store it now and change it after signing in.')
  } else {
    console.log(`  Password: (${passwordSource}) unchanged`)
  }
  console.log('')
}

main().catch((err) => {
  console.error('Failed to create super admin:', err instanceof Error ? err.message : err)
  process.exit(1)
})
