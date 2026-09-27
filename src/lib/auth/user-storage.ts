import { createHmac, randomUUID, timingSafeEqual } from 'crypto'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../supabase/admin.ts'
import { resolveAuthSecret } from './secret.ts'

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

// Emails that are granted the admin role at sign up.
const SUPER_ADMIN_EMAILS = [
  'admin@jvican.com',
  'admin@voteflow.live',
  'jvicanadmin@gmail.com',
]

// Minimum seconds between OTP sends for the same address, enforced per
// instance. Losing this on a cold start is acceptable; it stops button
// mashing, it is not a security control.
const OTP_RESEND_COOLDOWN_SECONDS = 45

// Length of one code window. A code is valid for the window it was derived in
// and the one before it, so a code mailed near a boundary still works.
const OTP_WINDOW_SECONDS = 300

// When a code was last requested, per instance. Deliberately not persisted:
// Supabase holds accounts and profile rows only.
const otpSentAt = new Map<string, number>()

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

/**
 * Turns a PostgREST error into a real Error.
 *
 * supabase-js resolves with the failure rather than throwing, and the object it
 * hands back is a plain object, not an Error instance. Throwing it directly
 * meant callers using `err instanceof Error` saw nothing useful and reported a
 * generic message, hiding the code and text that identify the actual fault.
 */
function fail(error: { code?: string; message?: string; details?: string } | null): never {
  const detail = [error?.code, error?.message, error?.details].filter(Boolean).join(': ')
  throw new Error(`Supabase request failed: ${detail || 'no detail returned'}`)
}

/**
 * Derives the code for an address in a given window.
 *
 * The code is a keyed digest of the address and the window index rather than a
 * stored random value, which is what makes verification self-reliant: nothing
 * is written anywhere, so the request that mints a code and the request that
 * redeems it can land on different serverless instances and still agree.
 *
 * The same inputs always give the same code, so requesting another code inside
 * the same window does not invalidate the one already sitting in the inbox.
 */
function deriveOtp(email: string, window: number): string {
  const digest = createHmac('sha256', resolveAuthSecret())
    .update(`${email}:${window}`)
    .digest()
  return String(digest.readUInt32BE(0) % 1_000_000).padStart(6, '0')
}

function currentWindow(): number {
  return Math.floor(Date.now() / (OTP_WINDOW_SECONDS * 1000))
}

function codesMatch(expected: string, provided: string): boolean {
  const a = Buffer.from(expected, 'utf-8')
  const b = Buffer.from(provided, 'utf-8')
  return a.length === b.length && timingSafeEqual(a, b)
}

async function getUsers(): Promise<UserAccount[]> {
  const { data, error } = await supabase()
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .order('created_at', { ascending: true })

  if (error) fail(error)
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

  if (error) fail(error)
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

  if (error) fail(error)
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
  if (error) fail(error)

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

    if (error) fail(error)
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
  if (error) fail(error)

  return toAccount(data as ProfileRow)
}

async function updatePassword(email: string, newPassword: string): Promise<boolean> {
  const normalized = normalizeEmail(email)
  const { data, error } = await supabase()
    .from('profiles')
    .update({ password_hash: bcrypt.hashSync(newPassword, 10) })
    .eq('email', normalized)
    .select('id')

  if (error) fail(error)
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
  const sentAt = otpSentAt.get(normalizeEmail(email))
  if (!sentAt) return 0

  const elapsed = Math.floor((Date.now() - sentAt) / 1000)
  return Math.max(0, OTP_RESEND_COOLDOWN_SECONDS - elapsed)
}

/**
 * Releases the resend cooldown. There is no code to delete, since the code is
 * derived rather than stored; this exists so a send that failed downstream
 * does not leave the address locked out for the rest of the cooldown.
 */
async function clearOtp(email: string): Promise<void> {
  otpSentAt.delete(normalizeEmail(email))
}

async function generateOtp(_email: string): Promise<string> {
  const normalized = normalizeEmail(_email)
  otpSentAt.set(normalized, Date.now())
  return deriveOtp(normalized, currentWindow())
}

async function verifyOtp(
  email: string,
  inputOtp: string
): Promise<{ valid: boolean; message: string }> {
  const normalized = normalizeEmail(email)
  const provided = String(inputOtp || '').trim()

  if (!/^\d{6}$/.test(provided)) {
    return { valid: false, message: 'Enter the 6-digit code from the email.' }
  }

  const window = currentWindow()

  // Accept the previous window as well, so a code emailed moments before a
  // boundary is still usable for the rest of its intended life.
  if (codesMatch(deriveOtp(normalized, window), provided)) {
    return { valid: true, message: 'Code verified.' }
  }
  if (codesMatch(deriveOtp(normalized, window - 1), provided)) {
    return { valid: true, message: 'Code verified.' }
  }

  return { valid: false, message: 'That code is not correct. Please check and try again.' }
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
