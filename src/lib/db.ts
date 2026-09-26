import {
  Event,
  Category,
  Nominee,
  VotePackage,
  Vote,
  Payment,
  Receipt,
  NomineeApplication,
  WithdrawalRequest,
  FinancialLedgerEntry,
  AuditLog,
  PlatformSettings,
  NomineeApplicationStatus,
  WithdrawalStatus,
  AuditAction,
  EmailLog,
  EmailType,
  NewsletterSubscriber,
  NewsletterStatus,
  NewsletterSource,
} from '@/types/database'

export interface MockStore {
  events: Event[]
  categories: Category[]
  nominees: Nominee[]
  votePackages: VotePackage[]
  votes: Vote[]
  payments: Payment[]
  receipts: Receipt[]
  applications: NomineeApplication[]
  withdrawals: WithdrawalRequest[]
  ledger: FinancialLedgerEntry[]
  auditLogs: AuditLog[]
  emailLogs: EmailLog[]
  subscribers: NewsletterSubscriber[]
  settings: PlatformSettings
}

const STORAGE_KEY = 'jvican_votearena_store_v1'

const defaultStore: MockStore = {
  settings: {
    platform_fee_percent: 10,
    payout_delay_hours: 24,
    minimum_withdrawal_amount: 50000,
    maintenance_mode: false,
    require_manual_event_approval: true,
    settlement_gateway: 'TransactPay Auto-Settlement Engine',
  },
  events: [],
  categories: [],
  nominees: [],
  votePackages: [],
  votes: [],
  payments: [],
  receipts: [],
  applications: [],
  ledger: [],
  withdrawals: [],
  auditLogs: [],
  emailLogs: [],
  subscribers: [],
}

// Global store with localStorage synchronization
let mockStore: MockStore = { ...defaultStore }

function loadStore(): MockStore {
  if (typeof window === 'undefined') {
    return mockStore
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      mockStore = {
        ...defaultStore,
        ...parsed,
        settings: {
          ...defaultStore.settings,
          ...(parsed.settings || {}),
        },
        events: Array.isArray(parsed.events) ? parsed.events : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        nominees: Array.isArray(parsed.nominees) ? parsed.nominees : [],
        votePackages: Array.isArray(parsed.votePackages) ? parsed.votePackages : [],
        votes: Array.isArray(parsed.votes) ? parsed.votes : [],
        payments: Array.isArray(parsed.payments) ? parsed.payments : [],
        receipts: Array.isArray(parsed.receipts) ? parsed.receipts : [],
        applications: Array.isArray(parsed.applications) ? parsed.applications : [],
        ledger: Array.isArray(parsed.ledger) ? parsed.ledger : [],
        withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [],
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
        emailLogs: Array.isArray(parsed.emailLogs) ? parsed.emailLogs : [],
        subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
      }
    }
  } catch (e) {
    console.error('Error loading store from localStorage:', e)
  }
  return mockStore
}

function saveStore(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockStore))
  } catch (e) {
    console.error('Error saving store to localStorage:', e)
  }
}

// Setup browser initial load and cross-tab listener
if (typeof window !== 'undefined') {
  loadStore()
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      loadStore()
    }
  })
}

export const db = {
  // Events
  getEvents: () => loadStore().events,
  getEventBySlug: (slug: string) => loadStore().events.find((e) => e.slug === slug),
  getEventById: (id: string) => loadStore().events.find((e) => e.id === id),
  createEvent: (event: Event) => {
    loadStore()
    mockStore.events.push(event)
    // Log submission audit
    db.logAudit({
      admin_id: event.organizer_id,
      admin_name: event.organizer_name || 'Organizer',
      admin_email: event.organizer_email || 'organizer@jvican.com',
      action: 'ORGANIZER_SUBMITTED_EVENT',
      target_type: 'event',
      target_id: event.id,
      target_name: event.name,
      previous_state: 'draft',
      new_state: event.status,
      reason: 'Event submitted for Super Admin review.',
    })
    saveStore()
    return event
  },
  updateEvent: (id: string, update: Partial<Event>) => {
    loadStore()
    const idx = mockStore.events.findIndex((e) => e.id === id)
    if (idx !== -1) {
      mockStore.events[idx] = { ...mockStore.events[idx], ...update, updated_at: new Date().toISOString() }
      saveStore()
      return mockStore.events[idx]
    }
    return null
  },
  deleteEvent: (id: string) => {
    loadStore()
    const initialLen = mockStore.events.length
    mockStore.events = mockStore.events.filter((e) => e.id !== id && e.slug !== id)
    mockStore.categories = mockStore.categories.filter((c) => c.event_id !== id)
    mockStore.nominees = mockStore.nominees.filter((n) => n.event_id !== id)
    saveStore()
    return mockStore.events.length < initialLen
  },
  updateEventApprovalStatus: (
    id: string,
    status: 'approved' | 'published' | 'rejected',
    reason?: string,
    adminName: string = 'Chief Super Admin'
  ) => {
    loadStore()
    const ev = mockStore.events.find((e) => e.id === id)
    if (!ev) return null
    const oldStatus = ev.status
    ev.status = status
    if (reason) ev.rejection_reason = reason
    ev.updated_at = new Date().toISOString()
    saveStore()

    // Determine audit action
    const action: AuditAction =
      status === 'rejected' ? 'ADMIN_REJECTED_EVENT' : 'ADMIN_APPROVED_EVENT'

    db.logAudit({
      admin_id: 'admin-0000-0000-0000-000000000000',
      admin_name: adminName,
      admin_email: 'admin@jvican.com',
      action,
      target_type: 'event',
      target_id: ev.id,
      target_name: ev.name,
      previous_state: oldStatus,
      new_state: status,
      reason: reason || (status === 'rejected' ? 'Rejected by super admin' : 'Approved for live marketplace listing'),
    })

    return ev
  },

  // Categories
  getCategories: (eventId?: string) => {
    const s = loadStore()
    return eventId ? s.categories.filter((c) => c.event_id === eventId) : s.categories
  },
  getCategoryById: (id: string) => loadStore().categories.find((c) => c.id === id),
  createCategory: (cat: Category) => {
    loadStore()
    mockStore.categories.push(cat)
    saveStore()
    return cat
  },
  deleteCategory: (id: string) => {
    loadStore()
    mockStore.categories = mockStore.categories.filter((c) => c.id !== id)
    saveStore()
  },

  // Nominees
  getNominees: (eventId?: string) => {
    const s = loadStore()
    return eventId ? s.nominees.filter((n) => n.event_id === eventId) : s.nominees
  },
  getNomineeByPublicId: (publicId: string) => loadStore().nominees.find((n) => n.public_id === publicId),
  getNomineeById: (id: string) => loadStore().nominees.find((n) => n.id === id),
  createNominee: (nom: Nominee) => {
    loadStore()
    mockStore.nominees.push(nom)
    saveStore()
    return nom
  },
  updateNominee: (id: string, update: Partial<Nominee>) => {
    loadStore()
    const idx = mockStore.nominees.findIndex((n) => n.id === id)
    if (idx !== -1) {
      mockStore.nominees[idx] = { ...mockStore.nominees[idx], ...update, updated_at: new Date().toISOString() }
      saveStore()
      return mockStore.nominees[idx]
    }
    return null
  },
  deleteNominee: (id: string) => {
    loadStore()
    mockStore.nominees = mockStore.nominees.filter((n) => n.id !== id)
    saveStore()
  },

  // Vote Packages
  getVotePackages: (eventId: string) => {
    const s = loadStore()
    const customPackages = s.votePackages.filter((p) => p.event_id === eventId)
    if (customPackages.length > 0) {
      return customPackages.sort((a, b) => a.display_order - b.display_order)
    }
    return [
      { id: 'p1', event_id: eventId, label: '1 Vote', quantity: 1, display_order: 1, created_at: new Date().toISOString() },
      { id: 'p2', event_id: eventId, label: '5 Votes', quantity: 5, display_order: 2, created_at: new Date().toISOString() },
      { id: 'p3', event_id: eventId, label: '10 Votes', quantity: 10, display_order: 3, created_at: new Date().toISOString() },
      { id: 'p4', event_id: eventId, label: '20 Votes', quantity: 20, display_order: 4, created_at: new Date().toISOString() },
      { id: 'p5', event_id: eventId, label: '50 Votes', quantity: 50, display_order: 5, created_at: new Date().toISOString() },
      { id: 'p6', event_id: eventId, label: '100 Votes', quantity: 100, display_order: 6, created_at: new Date().toISOString() },
    ]
  },

  // Votes
  getVotes: (eventId?: string) => {
    const s = loadStore()
    return eventId ? s.votes.filter((v) => v.event_id === eventId) : s.votes
  },
  getVoteByRef: (ref: string) => loadStore().votes.find((v) => v.payment_reference === ref),
  createVote: (vote: Vote) => {
    loadStore()
    mockStore.votes.push(vote)
    saveStore()
    return vote
  },
  updateVoteStatus: (ref: string, status: Vote['status'], paymentId?: string) => {
    loadStore()
    const v = mockStore.votes.find((vote) => vote.payment_reference === ref)
    if (v) {
      v.status = status
      if (paymentId) v.payment_id = paymentId

      // If newly confirmed, create immutable ledger entry (10% platform fee, 90% organizer)
      if (status === 'confirmed') {
        const ev = mockStore.events.find((e) => e.id === v.event_id)
        const gross = v.total_amount
        const platformFee = Math.round(gross * (mockStore.settings.platform_fee_percent / 100))
        const organizerAmount = gross - platformFee

        const existingLedger = mockStore.ledger.find((l) => l.payment_reference === ref)
        if (!existingLedger) {
          const ledgerEntry: FinancialLedgerEntry = {
            id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            transaction_id: paymentId || `pay-${ref}`,
            event_id: v.event_id,
            event_name: ev?.name || 'Voting Event',
            organizer_id: ev?.organizer_id || 'organizer-id',
            organizer_name: ev?.organizer_name || 'Event Organizer',
            voter_email: v.voter_email,
            gross_amount: gross,
            platform_fee: platformFee,
            organizer_amount: organizerAmount,
            currency: v.currency || 'NGN',
            payment_reference: ref,
            status: 'verified',
            created_at: new Date().toISOString(),
          }
          mockStore.ledger.push(ledgerEntry)
        }
      }

      saveStore()
      return v
    }
    return null
  },

  // Payments
  getPayments: (eventId?: string) => {
    const s = loadStore()
    return eventId ? s.payments.filter((p) => p.event_id === eventId) : s.payments
  },
  createPayment: (payment: Payment) => {
    loadStore()
    mockStore.payments.push(payment)
    saveStore()
    return payment
  },
  updatePaymentStatus: (ref: string, status: Payment['status'], gatewayRef?: string) => {
    loadStore()
    const p = mockStore.payments.find((pay) => pay.payment_reference === ref)
    if (p) {
      p.status = status
      if (gatewayRef) p.gateway_reference = gatewayRef
      p.updated_at = new Date().toISOString()
      saveStore()
      return p
    }
    return null
  },

  // Receipts
  getReceiptByPublicId: (publicId: string) => loadStore().receipts.find((r) => r.public_id === publicId),
  getReceiptByVoteId: (voteId: string) => loadStore().receipts.find((r) => r.vote_id === voteId),
  createReceipt: (receipt: Receipt) => {
    loadStore()
    mockStore.receipts.push(receipt)
    saveStore()
    return receipt
  },

  // Nominee Vote Counts & Leaderboard
  getNomineeVoteCount: (nomineeId: string) => {
    const s = loadStore()
    return s.votes
      .filter((v) => v.nominee_id === nomineeId && v.status === 'confirmed')
      .reduce((acc, v) => acc + v.quantity, 0)
  },

  getLeaderboard: (eventId: string, categoryId?: string) => {
    const s = loadStore()
    let noms = s.nominees.filter((n) => n.event_id === eventId && n.status === 'active')
    if (categoryId) {
      noms = noms.filter((n) => n.category_id === categoryId)
    }

    const categoriesMap = new Map(s.categories.map((c) => [c.id, c.name]))

    const scored = noms.map((n) => {
      const voteCount = s.votes
        .filter((v) => v.nominee_id === n.id && v.status === 'confirmed')
        .reduce((sum, v) => sum + v.quantity, 0)

      return {
        nominee_id: n.id,
        nominee_name: n.name,
        nominee_slug: n.slug,
        nominee_image: n.image_url,
        public_id: n.public_id,
        category_id: n.category_id,
        category_name: categoriesMap.get(n.category_id) || 'General Category',
        vote_count: voteCount,
        rank: 0,
      }
    })

    scored.sort((a, b) => b.vote_count - a.vote_count)
    return scored.map((item, idx) => ({ ...item, rank: idx + 1 }))
  },

  // Nominee Applications
  getNomineeApplications: (eventId?: string) => {
    const s = loadStore()
    return eventId ? s.applications.filter((a) => a.event_id === eventId) : s.applications
  },

  createNomineeApplication: (app: NomineeApplication) => {
    loadStore()
    mockStore.applications.push(app)
    saveStore()
    return app
  },

  updateNomineeApplicationStatus: (
    id: string,
    status: NomineeApplicationStatus,
    adminNotes?: string
  ) => {
    loadStore()
    const app = mockStore.applications.find((a) => a.id === id)
    if (!app) return null

    app.status = status
    if (adminNotes !== undefined) app.admin_notes = adminNotes
    app.updated_at = new Date().toISOString()

    if (status === 'approved') {
      const existingNominee = mockStore.nominees.find(
        (n) => n.event_id === app.event_id && n.name.toLowerCase() === app.full_name.toLowerCase()
      )

      if (!existingNominee) {
        const existingPublicIds = new Set(mockStore.nominees.map((n) => n.public_id))
        let nextNumber = mockStore.nominees.filter((n) => n.event_id === app.event_id).length + 1
        let publicId = nextNumber < 10 ? `00${nextNumber}` : nextNumber < 100 ? `0${nextNumber}` : `${nextNumber}`
        while (existingPublicIds.has(publicId)) {
          nextNumber++
          publicId = nextNumber < 10 ? `00${nextNumber}` : nextNumber < 100 ? `0${nextNumber}` : `${nextNumber}`
        }

        const newNominee: Nominee = {
          id: `nom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          event_id: app.event_id,
          category_id: app.category_id,
          name: app.full_name,
          slug: app.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: app.bio || app.reason_to_win || 'Contestant approved by event organizers.',
          image_url: app.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
          public_id: publicId,
          display_order: mockStore.nominees.filter((n) => n.event_id === app.event_id).length + 1,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        mockStore.nominees.push(newNominee)
      }
    }

    saveStore()
    return app
  },

  // Financial Ledger & Accounting System
  getLedger: (eventId?: string, organizerId?: string) => {
    const s = loadStore()
    let list = s.ledger
    if (eventId) list = list.filter((l) => l.event_id === eventId)
    if (organizerId) list = list.filter((l) => l.organizer_id === organizerId)
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getFinancialBreakdown: (organizerId?: string, eventId?: string) => {
    const ledger = db.getLedger(eventId, organizerId)
    const withdrawals = db.getWithdrawals(organizerId, eventId)

    const grossRevenue = ledger
      .filter((l) => l.status === 'verified')
      .reduce((sum, l) => sum + l.gross_amount, 0)

    const platformFees = ledger
      .filter((l) => l.status === 'verified')
      .reduce((sum, l) => sum + l.platform_fee, 0)

    const organizerNetEarnings = grossRevenue - platformFees

    const completedWithdrawals = withdrawals
      .filter((w) => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0)

    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === 'pending_approval' || w.status === 'approved' || w.status === 'processing')
      .reduce((sum, w) => sum + w.amount, 0)

    const availableBalance = organizerNetEarnings - completedWithdrawals - pendingWithdrawals

    return {
      grossRevenue,
      platformFees,
      organizerNetEarnings,
      completedWithdrawals,
      pendingWithdrawals,
      availableBalance: Math.max(0, availableBalance),
    }
  },

  // Withdrawals Management
  getWithdrawals: (organizerId?: string, eventId?: string) => {
    const s = loadStore()
    let list = s.withdrawals
    if (organizerId) list = list.filter((w) => w.organizer_id === organizerId)
    if (eventId) list = list.filter((w) => w.event_id === eventId)
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getWithdrawalById: (id: string) => loadStore().withdrawals.find((w) => w.id === id),

  requestWithdrawal: (req: {
    organizer_id: string
    organizer_name: string
    organizer_email: string
    event_id?: string | null
    event_name?: string | null
    amount: number
    currency?: string
    payout_bank: string
    payout_account_number: string
    payout_account_name: string
  }) => {
    loadStore()
    const id = `WD-${Math.floor(10000 + Math.random() * 90000)}`
    const newReq: WithdrawalRequest = {
      id,
      organizer_id: req.organizer_id,
      organizer_name: req.organizer_name,
      organizer_email: req.organizer_email,
      event_id: req.event_id || null,
      event_name: req.event_name || 'General Organizer Wallet',
      amount: req.amount,
      currency: req.currency || 'NGN',
      payout_bank: req.payout_bank,
      payout_account_number: req.payout_account_number,
      payout_account_name: req.payout_account_name,
      status: 'pending_approval',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockStore.withdrawals.push(newReq)

    db.logAudit({
      admin_id: req.organizer_id,
      admin_name: req.organizer_name,
      admin_email: req.organizer_email,
      action: 'ORGANIZER_REQUESTED_WITHDRAWAL',
      target_type: 'withdrawal',
      target_id: id,
      target_name: `Withdrawal request ₦${req.amount.toLocaleString()}`,
      previous_state: 'none',
      new_state: 'pending_approval',
      reason: 'Disbursement request initiated by organizer.',
    })

    saveStore()
    return newReq
  },

  updateWithdrawalStatus: (
    id: string,
    status: WithdrawalStatus,
    reason?: string,
    adminId: string = 'admin-0000-0000-0000-000000000000',
    adminName: string = 'Chief Super Admin'
  ) => {
    loadStore()
    const w = mockStore.withdrawals.find((req) => req.id === id)
    if (!w) return null
    const oldStatus = w.status
    w.status = status
    w.admin_id = adminId
    w.updated_at = new Date().toISOString()

    if (reason) w.rejection_reason = reason
    if (status === 'approved') w.approved_at = new Date().toISOString()
    if (status === 'completed') w.completed_at = new Date().toISOString()

    let action: AuditAction = 'ADMIN_APPROVED_WITHDRAWAL'
    if (status === 'rejected') action = 'ADMIN_REJECTED_WITHDRAWAL'
    if (status === 'completed') action = 'ADMIN_COMPLETED_WITHDRAWAL'

    db.logAudit({
      admin_id: adminId,
      admin_name: adminName,
      admin_email: 'admin@jvican.com',
      action,
      target_type: 'withdrawal',
      target_id: w.id,
      target_name: `Withdrawal ${w.id} (${w.organizer_name})`,
      previous_state: oldStatus,
      new_state: status,
      reason: reason || `Withdrawal marked as ${status}`,
    })

    saveStore()
    return w
  },

  // Audit Logs
  getAuditLogs: (limit?: number) => {
    const s = loadStore()
    const logs = [...s.auditLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return limit ? logs.slice(0, limit) : logs
  },

  logAudit: (log: Omit<AuditLog, 'id' | 'created_at'>) => {
    const entry: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    }
    mockStore.auditLogs.unshift(entry)
    saveStore()
    return entry
  },

  // Platform Settings
  getPlatformSettings: () => loadStore().settings,
  updatePlatformSettings: (update: Partial<PlatformSettings>, adminName: string = 'Chief Super Admin') => {
    loadStore()
    mockStore.settings = { ...mockStore.settings, ...update }
    db.logAudit({
      admin_id: 'admin-0000-0000-0000-000000000000',
      admin_name: adminName,
      admin_email: 'admin@jvican.com',
      action: 'ADMIN_UPDATED_PLATFORM_SETTING',
      target_type: 'setting',
      target_id: 'global-settings',
      target_name: 'Platform Commission & Settlement Settings',
      previous_state: 'configured',
      new_state: 'updated',
      metadata: update,
    })
    saveStore()
    return mockStore.settings
  },

  // Email Logs System
  getEmailLogs: (type?: EmailType, recipient?: string) => {
    const s = loadStore()
    let logs = [...s.emailLogs]
    if (type) logs = logs.filter((l) => l.type === type)
    if (recipient) logs = logs.filter((l) => l.recipient.toLowerCase() === recipient.toLowerCase())
    return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getEmailLogByIdempotencyKey: (key: string) => {
    const s = loadStore()
    return s.emailLogs.find((l) => l.idempotency_key === key && l.status === 'sent')
  },

  createEmailLog: (log: Omit<EmailLog, 'id' | 'created_at'> & { id?: string; created_at?: string }) => {
    loadStore()
    const entry: EmailLog = {
      ...log,
      id: log.id || `eml-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: log.created_at || new Date().toISOString(),
    }
    mockStore.emailLogs.unshift(entry)
    saveStore()
    return entry
  },

  updateEmailLog: (id: string, update: Partial<EmailLog>) => {
    loadStore()
    const idx = mockStore.emailLogs.findIndex((l) => l.id === id)
    if (idx !== -1) {
      mockStore.emailLogs[idx] = { ...mockStore.emailLogs[idx], ...update }
      saveStore()
      return mockStore.emailLogs[idx]
    }
    return null
  },

  // Newsletter Subscribers System
  getNewsletterSubscribers: (status?: NewsletterStatus) => {
    const s = loadStore()
    let list = [...s.subscribers]
    if (status) list = list.filter((sub) => sub.status === status)
    return list.sort((a, b) => new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime())
  },

  getNewsletterSubscriberByEmail: (email: string) => {
    const s = loadStore()
    const normalized = email.trim().toLowerCase()
    return s.subscribers.find((sub) => sub.email.toLowerCase() === normalized)
  },

  subscribeNewsletter: (data: {
    email: string
    name?: string | null
    source?: NewsletterSource
    resendContactId?: string | null
  }) => {
    loadStore()
    const normalized = data.email.trim().toLowerCase()
    const existingIdx = mockStore.subscribers.findIndex((s) => s.email.toLowerCase() === normalized)

    if (existingIdx !== -1) {
      const existing = mockStore.subscribers[existingIdx]
      if (existing.status === 'UNSUBSCRIBED') {
        existing.status = 'SUBSCRIBED'
        existing.unsubscribed_at = null
        existing.subscribed_at = new Date().toISOString()
        existing.updated_at = new Date().toISOString()
        if (data.name) existing.name = data.name.trim()
        if (data.source) existing.source = data.source
        if (data.resendContactId) existing.resend_contact_id = data.resendContactId
        saveStore()

        db.logAudit({
          admin_id: 'system',
          admin_name: 'JVican Newsletter Engine',
          admin_email: 'newsletter@jvican.com',
          action: 'NEWSLETTER_SUBSCRIBED',
          target_type: 'newsletter',
          target_id: existing.id,
          target_name: existing.email,
          previous_state: 'UNSUBSCRIBED',
          new_state: 'SUBSCRIBED',
          reason: 'Subscriber re-opted in to newsletter.',
        })

        return { subscriber: existing, isNew: false }
      }
      // Already subscribed
      return { subscriber: existing, isNew: false }
    }

    const newSubscriber: NewsletterSubscriber = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: normalized,
      name: data.name ? data.name.trim() : null,
      status: 'SUBSCRIBED',
      source: data.source || 'WEBSITE',
      resend_contact_id: data.resendContactId || null,
      subscribed_at: new Date().toISOString(),
      unsubscribed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockStore.subscribers.unshift(newSubscriber)
    saveStore()

    db.logAudit({
      admin_id: 'system',
      admin_name: 'JVican Newsletter Engine',
      admin_email: 'newsletter@jvican.com',
      action: 'NEWSLETTER_SUBSCRIBED',
      target_type: 'newsletter',
      target_id: newSubscriber.id,
      target_name: newSubscriber.email,
      previous_state: 'none',
      new_state: 'SUBSCRIBED',
      reason: `Subscribed via ${data.source || 'WEBSITE'}`,
    })

    return { subscriber: newSubscriber, isNew: true }
  },

  unsubscribeNewsletter: (email: string) => {
    loadStore()
    const normalized = email.trim().toLowerCase()
    const existing = mockStore.subscribers.find((s) => s.email.toLowerCase() === normalized)

    if (existing) {
      existing.status = 'UNSUBSCRIBED'
      existing.unsubscribed_at = new Date().toISOString()
      existing.updated_at = new Date().toISOString()
      saveStore()

      db.logAudit({
        admin_id: 'system',
        admin_name: 'JVican Newsletter Engine',
        admin_email: 'newsletter@jvican.com',
        action: 'NEWSLETTER_UNSUBSCRIBED',
        target_type: 'newsletter',
        target_id: existing.id,
        target_name: existing.email,
        previous_state: 'SUBSCRIBED',
        new_state: 'UNSUBSCRIBED',
        reason: 'Subscriber clicked unsubscribe link.',
      })

      return existing
    }
    return null
  },

  deleteNewsletterSubscriber: (id: string) => {
    loadStore()
    const beforeLen = mockStore.subscribers.length
    mockStore.subscribers = mockStore.subscribers.filter((s) => s.id !== id)
    const deleted = mockStore.subscribers.length < beforeLen
    if (deleted) saveStore()
    return deleted
  },
}
