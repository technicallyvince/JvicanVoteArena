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

export type EventStatus = 'draft' | 'published' | 'closed'

export interface Event {
  id: string
  organizer_id: string
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  cover_image_url?: string | null
  status: EventStatus
  start_date: string
  end_date: string
  vote_price: number
  currency: string
  allow_multiple_votes: boolean
  show_live_results: boolean
  is_featured: boolean
  display_order: number
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
  created_at: string
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
