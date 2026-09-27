import fs from 'fs'
import path from 'path'
import { randomInt, randomBytes, timingSafeEqual } from 'crypto'
import bcrypt from 'bcryptjs'

export interface UserAccount {
  id: string
  name: string
  email: string
  passwordHash: string
  role: 'organizer' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface OtpRecord {
  email: string
  otp: string
  expiresAt: number
  issuedAt: number
  attempts: number
}

// Fallback directory for storing local user accounts in file system if needed
const DATA_DIR = path.join(process.cwd(), '.data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const OTP_STORE = new Map<string, OtpRecord>()

// Pre-seeded super admin emails
const SUPER_ADMIN_EMAILS = [
  'admin@jvican.com',
  'admin@voteflow.live',
  'jvicanadmin@gmail.com',
]

// Minimum seconds between OTP sends for the same address
const OTP_RESEND_COOLDOWN_SECONDS = 45

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    } catch {
      // Ignored
    }
  }
}

function loadUsers(): UserAccount[] {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) {
    // Seed default users if file does not exist
    const defaultPasswordHash = bcrypt.hashSync('Admin@123456', 10)
    const organizerPasswordHash = bcrypt.hashSync('Organizer@123456', 10)

    const defaultUsers: UserAccount[] = [
      {
        id: 'usr-admin-1',
        name: 'JVican Super Admin',
        email: 'admin@jvican.com',
        passwordHash: defaultPasswordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-organizer-1',
        name: 'Apex Events Organizer',
        email: 'organizer@jvican.com',
        passwordHash: organizerPasswordHash,
        role: 'organizer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8')
      return defaultUsers
    } catch {
      return defaultUsers
    }
  }

  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw) as UserAccount[]
  } catch {
    return []
  }
}

function saveUsers(users: UserAccount[]) {
  ensureDataDir()
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save users.json', err)
  }
}

export const userStorage = {
  getUsers: (): UserAccount[] => {
    return loadUsers()
  },

  findByEmail: (email: string): UserAccount | null => {
    const users = loadUsers()
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    return found || null
  },

  findById: (id: string): UserAccount | null => {
    const users = loadUsers()
    const found = users.find((u) => u.id === id)
    return found || null
  },

  createUser: (params: { name: string; email: string; password: string }): UserAccount => {
    const users = loadUsers()
    const normalizedEmail = params.email.trim().toLowerCase()

    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail)
    if (exists) {
      throw new Error('An account with this email address already exists.')
    }

    const isAdmin =
      SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalizedEmail) ||
      normalizedEmail.startsWith('admin@')

    const passwordHash = bcrypt.hashSync(params.password, 10)
    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: params.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: isAdmin ? 'admin' : 'organizer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    users.push(newUser)
    saveUsers(users)
    return newUser
  },

  /**
   * Create a super admin, or reset the password/role of an existing account.
   * Unlike `createUser` this always forces the `admin` role, so it can repair
   * an account that was originally created as an organizer.
   */
  upsertAdmin: (params: { name: string; email: string; password: string }): UserAccount => {
    const users = loadUsers()
    const normalizedEmail = params.email.trim().toLowerCase()
    const passwordHash = bcrypt.hashSync(params.password, 10)
    const now = new Date().toISOString()

    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail)
    if (existing) {
      existing.passwordHash = passwordHash
      existing.role = 'admin'
      if (params.name?.trim()) {
        existing.name = params.name.trim()
      }
      existing.updatedAt = now
      saveUsers(users)
      return existing
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${randomBytes(4).toString('hex')}`,
      name: params.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    }

    users.push(newUser)
    saveUsers(users)
    return newUser
  },

  updatePassword: (email: string, newPassword: string): boolean => {
    const users = loadUsers()
    const normalizedEmail = email.trim().toLowerCase()
    const idx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail)
    if (idx === -1) return false

    users[idx].passwordHash = bcrypt.hashSync(newPassword, 10)
    users[idx].updatedAt = new Date().toISOString()
    saveUsers(users)
    return true
  },

  verifyPassword: (password: string, hash: string): boolean => {
    try {
      return bcrypt.compareSync(password, hash)
    } catch {
      return false
    }
  },

  // OTP Management
  /** Returns seconds remaining before another OTP may be issued, or 0 if allowed. */
  otpResendCooldown: (email: string): number => {
    const normalized = email.trim().toLowerCase()
    const record = OTP_STORE.get(normalized)
    if (!record) return 0

    const elapsed = Math.floor((Date.now() - record.issuedAt) / 1000)
    const remaining = OTP_RESEND_COOLDOWN_SECONDS - elapsed
    return remaining > 0 ? remaining : 0
  },

  generateOtp: (email: string, expiresInMinutes: number = 10): string => {
    const normalized = email.trim().toLowerCase()

    // Cryptographically secure 6-digit numeric code (000000-999999, uniform)
    const otp = randomInt(0, 1_000_000).toString().padStart(6, '0')

    // Never reuse the previous code for the same address
    const existing = OTP_STORE.get(normalized)
    if (existing) {
      existing.otp = otp
      existing.expiresAt = Date.now() + expiresInMinutes * 60 * 1000
      existing.attempts = 0
      existing.issuedAt = Date.now()
      return otp
    }

    OTP_STORE.set(normalized, {
      email: normalized,
      otp,
      expiresAt: Date.now() + expiresInMinutes * 60 * 1000,
      attempts: 0,
      issuedAt: Date.now(),
    })

    return otp
  },

  verifyOtp: (email: string, inputOtp: string): { valid: boolean; message: string } => {
    const normalized = email.trim().toLowerCase()
    const record = OTP_STORE.get(normalized)

    if (!record) {
      return { valid: false, message: 'No active OTP found. Please request a new code.' }
    }

    if (Date.now() > record.expiresAt) {
      OTP_STORE.delete(normalized)
      return { valid: false, message: 'Verification code has expired. Please request a new code.' }
    }

    if (record.attempts >= 5) {
      OTP_STORE.delete(normalized)
      return { valid: false, message: 'Too many incorrect attempts. Please request a new code.' }
    }

    record.attempts += 1

    // Constant-time comparison to avoid timing leaks
    const candidate = inputOtp.trim()
    const a = Buffer.from(candidate.padEnd(6, '\0').slice(0, 6))
    const b = Buffer.from(record.otp.padEnd(6, '\0').slice(0, 6))
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { valid: false, message: 'Invalid verification code.' }
    }

    // OTP is valid - consume it
    OTP_STORE.delete(normalized)
    return { valid: true, message: 'OTP verified successfully.' }
  },
}
