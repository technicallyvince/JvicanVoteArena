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
  settings: PlatformSettings
}

// Global in-memory cache — starts empty; all live data comes from Supabase
let mockStore: MockStore = {
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
}

export const db = {
  // Events
  getEvents: () => mockStore.events,
  getEventBySlug: (slug: string) => mockStore.events.find((e) => e.slug === slug),
  getEventById: (id: string) => mockStore.events.find((e) => e.id === id),
  createEvent: (event: Event) => {
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
    return event
  },
  updateEvent: (id: string, update: Partial<Event>) => {
    const idx = mockStore.events.findIndex((e) => e.id === id)
    if (idx !== -1) {
      mockStore.events[idx] = { ...mockStore.events[idx], ...update, updated_at: new Date().toISOString() }
      return mockStore.events[idx]
    }
    return null
  },
  updateEventApprovalStatus: (
    id: string,
    status: 'approved' | 'published' | 'rejected',
    reason?: string,
    adminName: string = 'Chief Super Admin'
  ) => {
    const ev = mockStore.events.find((e) => e.id === id)
    if (!ev) return null
    const oldStatus = ev.status
    ev.status = status
    if (reason) ev.rejection_reason = reason
    ev.updated_at = new Date().toISOString()

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
  getCategories: (eventId?: string) =>
    eventId ? mockStore.categories.filter((c) => c.event_id === eventId) : mockStore.categories,
  getCategoryById: (id: string) => mockStore.categories.find((c) => c.id === id),
  createCategory: (cat: Category) => {
    mockStore.categories.push(cat)
    return cat
  },
  deleteCategory: (id: string) => {
    mockStore.categories = mockStore.categories.filter((c) => c.id !== id)
  },

  // Nominees
  getNominees: (eventId?: string) =>
    eventId ? mockStore.nominees.filter((n) => n.event_id === eventId) : mockStore.nominees,
  getNomineeByPublicId: (publicId: string) => mockStore.nominees.find((n) => n.public_id === publicId),
  getNomineeById: (id: string) => mockStore.nominees.find((n) => n.id === id),
  createNominee: (nom: Nominee) => {
    mockStore.nominees.push(nom)
    return nom
  },
  updateNominee: (id: string, update: Partial<Nominee>) => {
    const idx = mockStore.nominees.findIndex((n) => n.id === id)
    if (idx !== -1) {
      mockStore.nominees[idx] = { ...mockStore.nominees[idx], ...update, updated_at: new Date().toISOString() }
      return mockStore.nominees[idx]
    }
    return null
  },
  deleteNominee: (id: string) => {
    mockStore.nominees = mockStore.nominees.filter((n) => n.id !== id)
  },

  // Vote Packages
  getVotePackages: (eventId: string) => {
    const customPackages = mockStore.votePackages.filter((p) => p.event_id === eventId)
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
  getVotes: (eventId?: string) =>
    eventId ? mockStore.votes.filter((v) => v.event_id === eventId) : mockStore.votes,
  getVoteByRef: (ref: string) => mockStore.votes.find((v) => v.payment_reference === ref),
  createVote: (vote: Vote) => {
    mockStore.votes.push(vote)
    return vote
  },
  updateVoteStatus: (ref: string, status: Vote['status'], paymentId?: string) => {
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

      return v
    }
    return null
  },

  // Payments
  getPayments: (eventId?: string) =>
    eventId ? mockStore.payments.filter((p) => p.event_id === eventId) : mockStore.payments,
  createPayment: (payment: Payment) => {
    mockStore.payments.push(payment)
    return payment
  },
  updatePaymentStatus: (ref: string, status: Payment['status'], gatewayRef?: string) => {
    const p = mockStore.payments.find((pay) => pay.payment_reference === ref)
    if (p) {
      p.status = status
      if (gatewayRef) p.gateway_reference = gatewayRef
      p.updated_at = new Date().toISOString()
      return p
    }
    return null
  },

  // Receipts
  getReceiptByPublicId: (publicId: string) => mockStore.receipts.find((r) => r.public_id === publicId),
  getReceiptByVoteId: (voteId: string) => mockStore.receipts.find((r) => r.vote_id === voteId),
  createReceipt: (receipt: Receipt) => {
    mockStore.receipts.push(receipt)
    return receipt
  },

  // Nominee Vote Counts & Leaderboard
  getNomineeVoteCount: (nomineeId: string) => {
    return mockStore.votes
      .filter((v) => v.nominee_id === nomineeId && v.status === 'confirmed')
      .reduce((acc, v) => acc + v.quantity, 0)
  },

  getLeaderboard: (eventId: string, categoryId?: string) => {
    let noms = mockStore.nominees.filter((n) => n.event_id === eventId && n.status === 'active')
    if (categoryId) {
      noms = noms.filter((n) => n.category_id === categoryId)
    }

    const categoriesMap = new Map(mockStore.categories.map((c) => [c.id, c.name]))

    const scored = noms.map((n) => {
      const voteCount = mockStore.votes
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
  getNomineeApplications: (eventId?: string) =>
    eventId ? mockStore.applications.filter((a) => a.event_id === eventId) : mockStore.applications,

  createNomineeApplication: (app: NomineeApplication) => {
    mockStore.applications.push(app)
    return app
  },

  updateNomineeApplicationStatus: (
    id: string,
    status: NomineeApplicationStatus,
    adminNotes?: string
  ) => {
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

    return app
  },

  // Financial Ledger & Accounting System
  getLedger: (eventId?: string, organizerId?: string) => {
    let list = mockStore.ledger
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
    let list = mockStore.withdrawals
    if (organizerId) list = list.filter((w) => w.organizer_id === organizerId)
    if (eventId) list = list.filter((w) => w.event_id === eventId)
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getWithdrawalById: (id: string) => mockStore.withdrawals.find((w) => w.id === id),

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

    return newReq
  },

  updateWithdrawalStatus: (
    id: string,
    status: WithdrawalStatus,
    reason?: string,
    adminId: string = 'admin-0000-0000-0000-000000000000',
    adminName: string = 'Chief Super Admin'
  ) => {
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

    return w
  },

  // Audit Logs
  getAuditLogs: (limit?: number) => {
    const logs = [...mockStore.auditLogs].sort(
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
    return entry
  },

  // Platform Settings
  getPlatformSettings: () => mockStore.settings,
  updatePlatformSettings: (update: Partial<PlatformSettings>, adminName: string = 'Chief Super Admin') => {
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
    return mockStore.settings
  },
}
