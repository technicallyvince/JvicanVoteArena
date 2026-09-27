/**
 * Create or reset a super admin account in the local user store.
 *
 * Usage:
 *   node scripts/create_super_admin.ts [email]
 *
 * The password is never hardcoded. Resolution order:
 *   1. SUPER_ADMIN_PASSWORD env var
 *   2. Interactive hidden prompt (when a TTY is attached)
 *   3. A strong random password, printed once
 *
 * Re-running for an existing address resets its password and forces role=admin,
 * so an account that was created as an organizer can be promoted.
 */

import { randomBytes } from 'node:crypto'
import { userStorage } from '../src/lib/auth/user-storage.ts'

const DEFAULT_EMAIL = 'admin@jvican.com'
const DEFAULT_NAME = 'JVican Super Admin'
const MIN_PASSWORD_LENGTH = 12

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
  const argEmail = process.argv[2]
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

  const existing = userStorage.findByEmail(email)
  const user = userStorage.upsertAdmin({ name, email, password })

  console.log('')
  console.log(existing ? 'Super admin reset' : 'Super admin created')
  console.log('-------------------------------')
  console.log(`  Email:  ${user.email}`)
  console.log(`  Name:   ${user.name}`)
  console.log(`  Role:   ${user.role}`)
  console.log(`  User ID: ${user.id}`)

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
