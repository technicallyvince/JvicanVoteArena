export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  user_id?: string
  full_name: string
  email: string
  avatar_url?: string | null
  phone?: string | null
  created_at: string
  updated_at: string
}

export type EventStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'published'
  | 'closed'
  | 'rejected'
  | 'archived'

export interface Event {
  id: string
  organizer_id: string
  organizer_name?: string
  organizer_email?: string
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  cover_image_url?: string | null
  status: EventStatus
  rejection_reason?: string | null
  start_date: string
  end_date: string
  vote_price: number
  currency: string
  allow_multiple_votes: boolean
  show_live_results: boolean
  is_featured: boolean
  display_order: number
  payout_bank?: string | null
  payout_account_number?: string | null
  payout_account_name?: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  event_id: string
  name: string
  slug: string
  description?: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export type NomineeStatus = 'active' | 'disqualified' | 'withdrawn'

export interface Nominee {
  id: string
  event_id: string
  category_id: string
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  public_id: string
  display_order: number
  status: NomineeStatus
  created_at: string
  updated_at: string
}

export interface VotePackage {
  id: string
  event_id: string
  label: string
  quantity: number
  display_order: number
  created_at: string
}

export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'cancelled'

export interface Payment {
  id: string
  event_id: string
  voter_email: string
  amount: number
  currency: string
  payment_reference: string
  gateway_reference?: string | null
  gateway: string
  status: PaymentStatus
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export type VoteStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled' | 'refunded'

export interface Vote {
  id: string
  event_id: string
  category_id: string
  nominee_id: string
  voter_email: string
  quantity: number
  unit_price: number
  total_amount: number
  currency: string
  payment_id?: string | null
  payment_reference: string
  status: VoteStatus
  created_at: string
}

export interface Receipt {
  id: string
  vote_id: string
  receipt_number: string
  public_id: string
  voter_email: string
  amount: number
  currency: string
  issued_at: string
  email_status: 'queued' | 'sent' | 'failed'
  email_sent_at?: string | null
  email_idempotency_key?: string | null
  created_at: string
}

export type EmailType =
  | 'RECEIPT'
  | 'OTP'
  | 'AUTH_NOTIFICATION'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_PENDING'
  | 'EVENT_SUBMITTED'
  | 'EVENT_APPROVED'
  | 'EVENT_REJECTED'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'WITHDRAWAL_COMPLETED'
  | 'WITHDRAWAL_FAILED'
  | 'NEWSLETTER_WELCOME'
  | 'NEWSLETTER_BROADCAST'

export interface EmailLog {
  id: string
  type: EmailType
  recipient: string
  subject: string
  related_resource_type?: 'receipt' | 'payment' | 'event' | 'withdrawal' | 'newsletter' | string | null
  related_resource_id?: string | null
  provider: 'resend' | 'brevo' | 'system'
  primary_provider?: 'resend' | 'brevo' | 'system' | null
  provider_used?: 'resend' | 'brevo' | 'system' | null
  provider_message_id?: string | null
  idempotency_key?: string | null
  status: 'sent' | 'failed' | 'queued'
  attempt_count?: number
  error?: string | null
  sent_at?: string | null
  created_at: string
  updated_at?: string
}

export type NewsletterStatus = 'SUBSCRIBED' | 'UNSUBSCRIBED'
export type NewsletterSource = 'WEBSITE' | 'VOTING_FLOW' | 'ORGANIZER' | 'ADMIN'

export interface NewsletterSubscriber {
  id: string
  email: string
  name?: string | null
  status: NewsletterStatus
  source: NewsletterSource
  resend_contact_id?: string | null
  subscribed_at: string
  unsubscribed_at?: string | null
  created_at: string
  updated_at: string
}

export type NomineeApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface NomineeApplication {
  id: string
  event_id: string
  category_id: string
  full_name: string
  email: string
  phone: string
  bio?: string | null
  image_url?: string | null
  instagram_handle?: string | null
  reason_to_win?: string | null
  status: NomineeApplicationStatus
  admin_notes?: string | null
  created_at: string
  updated_at: string
}

export type WithdrawalStatus =
  | 'requested'
  | 'pending_approval'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'failed'

export interface WithdrawalRequest {
  id: string
  organizer_id: string
  organizer_name: string
  organizer_email: string
  event_id?: string | null
  event_name?: string | null
  amount: number
  currency: string
  payout_bank: string
  payout_account_number: string
  payout_account_name: string
  status: WithdrawalStatus
  rejection_reason?: string | null
  admin_id?: string | null
  approved_at?: string | null
  completed_at?: string | null
  created_at: string
  updated_at: string
}

export interface FinancialLedgerEntry {
  id: string
  transaction_id: string
  event_id: string
  event_name: string
  organizer_id: string
  organizer_name: string
  voter_email: string
  gross_amount: number
  platform_fee: number // 10%
  organizer_amount: number // 90%
  currency: string
  payment_reference: string
  status: 'verified' | 'pending' | 'reversed'
  created_at: string
}

export type AuditAction =
  | 'ADMIN_APPROVED_EVENT'
  | 'ADMIN_REJECTED_EVENT'
  | 'ADMIN_APPROVED_WITHDRAWAL'
  | 'ADMIN_REJECTED_WITHDRAWAL'
  | 'ADMIN_COMPLETED_WITHDRAWAL'
  | 'ADMIN_SUSPENDED_EVENT'
  | 'ADMIN_CHANGED_EVENT_STATUS'
  | 'ADMIN_UPDATED_PLATFORM_SETTING'
  | 'ORGANIZER_SUBMITTED_EVENT'
  | 'ORGANIZER_REQUESTED_WITHDRAWAL'
  | 'PAYMENT_VERIFIED'
  | 'NEWSLETTER_SUBSCRIBED'
  | 'NEWSLETTER_UNSUBSCRIBED'
  | 'EMAIL_SENT'

export interface AuditLog {
  id: string
  admin_id: string
  admin_name: string
  admin_email: string
  action: AuditAction
  target_type: 'event' | 'withdrawal' | 'setting' | 'user' | 'payment' | 'newsletter' | 'email'
  target_id: string
  target_name?: string
  previous_state?: string | null
  new_state?: string | null
  reason?: string | null
  metadata?: Record<string, any>
  created_at: string
}

export interface PlatformSettings {
  platform_fee_percent: number
  payout_delay_hours: number
  minimum_withdrawal_amount: number
  maintenance_mode: boolean
  require_manual_event_approval: boolean
  settlement_gateway: string
}

export interface LeaderboardEntry {
  nominee_id: string
  nominee_name: string
  nominee_slug: string
  nominee_image: string | null
  public_id: string
  category_id: string
  category_name: string
  vote_count: number
  rank: number
}
