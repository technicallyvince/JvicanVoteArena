import { createHash, randomInt, randomUUID, timingSafeEqual } from 'crypto'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../supabase/admin.ts'

export interface UserAccount {
  id: string
  name: string
  email: string
  passwordHash: string
  role: 'organizer' | 'admin'
  createdAt: string
  updatedAt: string
}

const PROFILE_COLUMNS = 'id, full_name, email, password_hash, role, created_at, updated_at'

/** Column shape of public.profiles as it exists in Supabase. */
interface ProfileRow {
  id: string
  full_name: string | null
  email: string | null
  password_hash: string | null
  role: string | null
  created_at: string
  updated_at: string
}

interface OtpRow {
  email: string
  otp_hash: string
  expires_at: string
  issued_at: string
  attempts: number
}

// Emails that are granted the admin role at sign up.
const SUPER_ADMIN_EMAILS = [
  'admin@jvican.com',
  'admin@voteflow.live',
  'jvicanadmin@gmail.com',
]

// Minimum seconds between OTP sends for the same address
const OTP_RESEND_COOLDOWN_SECONDS = 45

// Wrong guesses allowed before the code is discarded and a new one is required.
const MAX_OTP_ATTEMPTS = 5

// Minutes a code stays usable
const OTP_TTL_MINUTES = 10

/**
 * Bootstrap accounts.
 *
 * These exist so a fresh deployment has a way in. The password is only ever
 * written when the account has no credential at all, so it establishes the
 * first login without subsequently overwriting a password that was rotated
 * later. To change it afterwards, use `npm run superadmin <email>`.
 */
const BOOTSTRAP_ACCOUNTS: Array<{
  email: string
  name: string
  role: 'organizer' | 'admin'
  defaultPassword: string
}> = [
  {
    email: 'admin@jvican.com',
    name: 'JVican Super Admin',
    role: 'admin',
    defaultPassword: 'Admin@123456',
  },
  {
    email: 'organizer@jvican.com',
    name: 'Apex Events Organizer',
    role: 'organizer',
    defaultPassword: 'Organizer@123456',
  },
]

function normalizeEmail(email: string): string {
  return String(email).trim().toLowerCase()
}

function supabase() {
  const client = getSupabaseAdmin()
  if (!client) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }
  return client
}

function bootstrapFor(email: string) {
  return BOOTSTRAP_ACCOUNTS.find((account) => account.email === email)
}

function bootstrapPassword(): string {
  const configured = process.env.SUPER_ADMIN_PASSWORD
  if (configured && configured.trim()) return configured
  return BOOTSTRAP_ACCOUNTS[0].defaultPassword
}

function toAccount(row: ProfileRow): UserAccount {
  const email = normalizeEmail(row.email || '')
  return {
    id: row.id,
    name: row.full_name?.trim() || email.split('@')[0] || 'User',
    email,
    passwordHash: row.password_hash || '',
    role: row.role === 'admin' ? 'admin' : 'organizer',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505'
}

/** Codes are stored as a digest so the table never holds a usable code. */
function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex')
}

async function getUsers(): Promise<UserAccount[]> {
  const { data, error } = await supabase()
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .order('created_at', { ascending: true })

  if (error) throw error
  return ((data || []) as ProfileRow[]).map(toAccount)
}

/**
 * Looks up an account, and repairs a bootstrap account that predates the
 * Supabase migration: those rows were created by Supabase Auth and carry no
 * credential, so without this they could never sign in. Only ever fills an
 * absent hash, never replaces an existing one.
 */
async function findByEmail(email: string): Promise<UserAccount | null> {
  const normalized = normalizeEmail(email)
  const client = supabase()

  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('email', normalized)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const account = toAccount(data as ProfileRow)
  const bootstrap = bootstrapFor(normalized)

  if (!account.passwordHash && bootstrap) {
    const passwordHash = bcrypt.hashSync(bootstrapPassword(), 10)
    const { data: repaired, error: repairError } = await client
      .from('profiles')
      .update({ password_hash: passwordHash })
      .eq('id', account.id)
      .select(PROFILE_COLUMNS)
      .single()

    if (!repairError && repaired) return toAccount(repaired as ProfileRow)
  }

  return account
}

async function findById(id: string): Promise<UserAccount | null> {
  const { data, error } = await supabase()
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? toAccount(data as ProfileRow) : null
}

async function createUser(params: {
  name: string
  email: string
  password: string
}): Promise<UserAccount> {
  const normalized = normalizeEmail(params.email)
  const client = supabase()

  if (await findByEmail(normalized)) {
    throw new Error('An account with this email address already exists.')
  }

  const isAdmin = SUPER_ADMIN_EMAILS.includes(normalized) || normalized.startsWith('admin@')
  const name = params.name?.trim() || normalized.split('@')[0] || 'User'

  const { data, error } = await client
    .from('profiles')
    .insert({
      id: randomUUID(),
      full_name: name,
      email: normalized,
      password_hash: bcrypt.hashSync(params.password, 10),
      role: isAdmin ? 'admin' : 'organizer',
    })
    .select(PROFILE_COLUMNS)
    .single()

  if (isUniqueViolation(error)) {
    throw new Error('An account with this email address already exists.')
  }
  if (error) throw error

  return toAccount(data as ProfileRow)
}

async function upsertAdmin(params: {
  name: string
  email: string
  password: string
}): Promise<UserAccount> {
  const normalized = normalizeEmail(params.email)
  const client = supabase()
  const passwordHash = bcrypt.hashSync(params.password, 10)
  const name = params.name?.trim()

  const existing = await findByEmail(normalized)

  if (existing) {
    const { data, error } = await client
      .from('profiles')
      .update({
        password_hash: passwordHash,
        role: 'admin',
        ...(name ? { full_name: name } : {}),
      })
      .eq('id', existing.id)
      .select(PROFILE_COLUMNS)
      .single()

    if (error) throw error
    return toAccount(data as ProfileRow)
  }

  const { data, error } = await client
    .from('profiles')
    .insert({
      id: randomUUID(),
      full_name: name || normalized.split('@')[0] || 'Administrator',
      email: normalized,
      password_hash: passwordHash,
      role: 'admin',
    })
    .select(PROFILE_COLUMNS)
    .single()

  if (isUniqueViolation(error)) {
    throw new Error('An account with this email address already exists.')
  }
  if (error) throw error

  return toAccount(data as ProfileRow)
}

async function updatePassword(email: string, newPassword: string): Promise<boolean> {
  const normalized = normalizeEmail(email)
  const { data, error } = await supabase()
    .from('profiles')
    .update({ password_hash: bcrypt.hashSync(newPassword, 10) })
    .eq('email', normalized)
    .select('id')

  if (error) throw error
  return (data || []).length > 0
}

/**
 * Compares a password against a stored hash. Pure, so it stays synchronous and
 * needs no database round trip.
 */
function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) return false
  try {
    return bcrypt.compareSync(password, hash)
  } catch {
    return false
  }
}

async function otpResendCooldown(email: string): Promise<number> {
  const normalized = normalizeEmail(email)

  const { data, error } = await supabase()
    .from('auth_otps')
    .select('issued_at, expires_at')
    .eq('email', normalized)
    .maybeSingle()

  if (error) throw error
  if (!data) return 0
  if (new Date(data.expires_at).getTime() <= Date.now()) return 0

  const elapsed = Math.floor((Date.now() - new Date(data.issued_at).getTime()) / 1000)
  return Math.max(0, OTP_RESEND_COOLDOWN_SECONDS - elapsed)
}

async function clearOtp(email: string): Promise<void> {
  const { error } = await supabase().from('auth_otps').delete().eq('email', normalizeEmail(email))
  if (error) throw error
}

async function generateOtp(email: string, expiresInMinutes: number = OTP_TTL_MINUTES): Promise<string> {
  const normalized = normalizeEmail(email)
  const otp = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const now = Date.now()

  const { error } = await supabase().from('auth_otps').upsert(
    {
      email: normalized,
      otp_hash: hashOtp(otp),
      expires_at: new Date(now + expiresInMinutes * 60_000).toISOString(),
      issued_at: new Date(now).toISOString(),
      attempts: 0,
    },
    { onConflict: 'email' }
  )

  if (error) throw error
  return otp
}

async function verifyOtp(
  email: string,
  inputOtp: string
): Promise<{ valid: boolean; message: string }> {
  const normalized = normalizeEmail(email)

  const { data, error } = await supabase()
    .from('auth_otps')
    .select('*')
    .eq('email', normalized)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    return { valid: false, message: 'No active OTP found. Please request a new code.' }
  }

  const record = data as OtpRow

  if (new Date(record.expires_at).getTime() <= Date.now()) {
    await clearOtp(normalized)
    return { valid: false, message: 'This code has expired. Please request a new one.' }
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await clearOtp(normalized)
    return { valid: false, message: 'Too many attempts. Please request a new code.' }
  }

  const expected = Buffer.from(record.otp_hash, 'utf-8')
  const actual = Buffer.from(hashOtp(inputOtp), 'utf-8')
  const matches = expected.length === actual.length && timingSafeEqual(expected, actual)

  if (!matches) {
    await supabase()
      .from('auth_otps')
      .update({ attempts: record.attempts + 1 })
      .eq('email', normalized)
    return { valid: false, message: 'Incorrect code. Please try again.' }
  }

  await clearOtp(normalized)
  return { valid: true, message: 'Code verified.' }
}

export const userStorage = {
  getUsers,
  findByEmail,
  findById,
  createUser,
  upsertAdmin,
  updatePassword,
  verifyPassword,
  otpResendCooldown,
  clearOtp,
  generateOtp,
  verifyOtp,
}
