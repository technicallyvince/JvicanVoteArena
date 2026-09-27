import fs from 'fs'
import path from 'path'
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
  generateOtp: (email: string, expiresInMinutes: number = 10): string => {
    const normalized = email.trim().toLowerCase()
    // Generate 6 digit numeric code
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000

    OTP_STORE.set(normalized, {
      email: normalized,
      otp,
      expiresAt,
      attempts: 0,
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

    if (record.otp !== inputOtp.trim()) {
      return { valid: false, message: 'Invalid verification code.' }
    }

    // OTP is valid - consume it
    OTP_STORE.delete(normalized)
    return { valid: true, message: 'OTP verified successfully.' }
  },
}
