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

// Global in-memory cache for seamless full demo functionality
let mockStore: MockStore = {
  settings: {
    platform_fee_percent: 10,
    payout_delay_hours: 24,
    minimum_withdrawal_amount: 50000,
    maintenance_mode: false,
    require_manual_event_approval: true,
    settlement_gateway: 'TransactPay Auto-Settlement Engine',
  },
  events: [
    {
      id: 'e1111111-1111-1111-1111-111111111111',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      organizer_email: 'organizer@igbetitourism.org',
      name: 'Miss Igbeti 2026',
      slug: 'miss-igbeti-2026',
      description: 'The premier beauty and cultural pageant celebrating intelligence, grace, and heritage of marble city queens.',
      logo_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80',
      status: 'published',
      start_date: new Date(Date.now() - 5 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 12 * 86400000).toISOString(),
      vote_price: 100,
      currency: 'NGN',
      allow_multiple_votes: true,
      show_live_results: true,
      is_featured: true,
      display_order: 1,
      payout_bank: 'First Bank of Nigeria',
      payout_account_number: '3098124578',
      payout_account_name: 'Igbeti Tourism & Cultural Committee',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e2222222-2222-2222-2222-222222222222',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      organizer_email: 'organizer@igbetitourism.org',
      name: 'Mr Igbeti 2026',
      slug: 'mr-igbeti-2026',
      description: 'Annual leadership, youth excellence, and charismatic gentleman competition celebrating visionary young men.',
      logo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=80',
      status: 'published',
      start_date: new Date(Date.now() - 3 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 15 * 86400000).toISOString(),
      vote_price: 100,
      currency: 'NGN',
      allow_multiple_votes: true,
      show_live_results: true,
      is_featured: true,
      display_order: 2,
      payout_bank: 'Zenith Bank',
      payout_account_number: '1014882910',
      payout_account_name: 'Igbeti Youth Forum',
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e3333333-3333-3333-3333-333333333333',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      organizer_email: 'organizer@igbetitourism.org',
      name: 'MC Icon Igbeti 2026',
      slug: 'mc-icon-igbeti-2026',
      description: 'Recognizing top event hosts, hype masters, and master of ceremonies electrifying audiences across the region.',
      logo_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&auto=format&fit=crop&q=80',
      status: 'published',
      start_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 18 * 86400000).toISOString(),
      vote_price: 100,
      currency: 'NGN',
      allow_multiple_votes: true,
      show_live_results: true,
      is_featured: true,
      display_order: 3,
      payout_bank: 'Guaranty Trust Bank (GTB)',
      payout_account_number: '0129481230',
      payout_account_name: 'Oyo State Entertainers Guild',
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e4444444-4444-4444-4444-444444444444',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      organizer_email: 'organizer@igbetitourism.org',
      name: 'Best Teacher Igbeti 2026',
      slug: 'best-teacher-igbeti-2026',
      description: 'Honoring outstanding educators shaping minds, building character, and empowering the next generation in our schools.',
      logo_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80',
      status: 'published',
      start_date: new Date(Date.now() - 1 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 20 * 86400000).toISOString(),
      vote_price: 100,
      currency: 'NGN',
      allow_multiple_votes: true,
      show_live_results: true,
      is_featured: true,
      display_order: 4,
      payout_bank: 'Access Bank',
      payout_account_number: '0718294012',
      payout_account_name: 'Igbeti Education Trust',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e5555555-5555-5555-5555-555555555555',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      organizer_email: 'organizer@igbetitourism.org',
      name: 'Best Photographer Igbeti 2026',
      slug: 'best-photographer-igbeti-2026',
      description: 'Celebrating visual storytellers capturing culture, emotion, and landscapes through creative artistic lenses.',
      logo_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600&auto=format&fit=crop&q=80',
      status: 'closed',
      start_date: new Date(Date.now() - 25 * 86400000).toISOString(),
      end_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      vote_price: 100,
      currency: 'NGN',
      allow_multiple_votes: true,
      show_live_results: true,
      is_featured: true,
      display_order: 5,
      payout_bank: 'Kuda Microfinance Bank',
      payout_account_number: '2001928341',
      payout_account_name: 'Creative Lens Studio Ltd',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e-pending-1',
      organizer_id: 'org-2222-2222-2222-222222222222',
      organizer_name: 'National Campus Association',
      organizer_email: 'events@ncasouthwest.org',
      name: 'Oyo Campus Awards 2026',
      slug: 'oyo-campus-awards-2026',
      description: 'The biggest inter-campus leadership and creative awards honoring student creators, innovators, and scholars.',
      logo_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80',
      status: 'pending_approval',
      start_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 25 * 86400000).toISOString(),
      vote_price: 100,
      currency: 'NGN',
      allow_multiple_votes: true,
      show_live_results: true,
      is_featured: false,
      display_order: 6,
      payout_bank: 'United Bank for Africa (UBA)',
      payout_account_number: '2091823901',
      payout_account_name: 'NCA Southwest Regional Directorate',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'e-pending-2',
      organizer_id: 'org-3333-3333-3333-333333333333',
      organizer_name: 'Marble City Music Collective',
      organizer_email: 'info@marblemusic.ng',
      name: 'Yoruba Hip-Hop Talent Hunt 2026',
      slug: 'yoruba-hip-hop-talent-hunt-2026',
      description: 'Discovering next-generation indigenous lyricists, producers, and afro-fusion artists across Nigeria.',
      logo_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=80',
      status: 'pending_approval',
      start_date: new Date(Date.now() + 3 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
      vote_price: 100,
      currency: 'NGN',
      allow_multiple_votes: true,
      show_live_results: true,
      is_featured: false,
      display_order: 7,
      payout_bank: 'Zenith Bank',
      payout_account_number: '2190823412',
      payout_account_name: 'Marble City Media Productions',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
  ],
  categories: [
    // Categories for Miss Igbeti 2026
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      name: 'Overall Crown Queen',
      slug: 'overall-crown-queen',
      description: 'The supreme title holder representing Igbeti heritage and intellect',
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c1111111-2222-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      name: 'Miss Culture & Tourism',
      slug: 'miss-culture-tourism',
      description: 'Ambassador for eco-tourism, cultural festivals, and marble hills preservation',
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // Categories for Mr Igbeti 2026
    {
      id: 'c2222222-1111-1111-1111-111111111111',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      name: 'Mr Igbeti Supreme',
      slug: 'mr-igbeti-supreme',
      description: 'The flagship title for exemplary youth leadership and community engagement',
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c2222222-2222-1111-1111-111111111111',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      name: 'Mr Charisma & Style',
      slug: 'mr-charisma-style',
      description: 'Celebrating stage presence, style, and gentleman poise',
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // Categories for MC Icon Igbeti 2026
    {
      id: 'c3333333-1111-1111-1111-111111111111',
      event_id: 'e3333333-3333-3333-3333-333333333333',
      name: 'Event Host of the Year',
      slug: 'event-host-of-the-year',
      description: 'Master of ceremonies leading weddings, corporate galas, and live concerts',
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // Categories for Best Teacher Igbeti 2026
    {
      id: 'c4444444-1111-1111-1111-111111111111',
      event_id: 'e4444444-4444-4444-4444-444444444444',
      name: 'STEM Educator of the Year',
      slug: 'stem-educator-of-the-year',
      description: 'Pioneering science, technology, mathematics, and innovation in classrooms',
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c4444444-2222-1111-1111-111111111111',
      event_id: 'e4444444-4444-4444-4444-444444444444',
      name: 'Humanities & Arts Teacher',
      slug: 'humanities-arts-teacher',
      description: 'Fostering critical thinking, literature, language, and civic leadership',
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // Categories for Best Photographer 2026 (Closed contest)
    {
      id: 'c5555555-1111-1111-1111-111111111111',
      event_id: 'e5555555-5555-5555-5555-555555555555',
      name: 'Portrait & Landscape Photographer',
      slug: 'portrait-landscape-photographer',
      description: 'Mastery in portraiture, documentary storytelling, and landscape vistas',
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // Categories for Pending Events
    {
      id: 'c-pen1-1',
      event_id: 'e-pending-1',
      name: 'Campus Innovator of the Year',
      slug: 'campus-innovator-of-the-year',
      description: 'Student founders and technological trailblazers',
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-pen2-1',
      event_id: 'e-pending-2',
      name: 'Best Indigenous Lyricist',
      slug: 'best-indigenous-lyricist',
      description: 'Excellence in Yoruba poetry and modern hip-hop flow',
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  nominees: [
    // --- Miss Igbeti 2026 Contestants ---
    {
      id: 'n1111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Adebisi Folashade',
      slug: 'adebisi-folashade',
      description: 'Biochemistry undergraduate, advocate for girl-child education in rural communities, and passionate about community healthcare.',
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      public_id: 'MIG2601',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n1111111-2222-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Oluwaseun Kehinde',
      slug: 'oluwaseun-kehinde',
      description: 'Entrepreneur, fashion designer, and cultural enthusiast dedicated to empowering youth artisans across the marble region.',
      image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      public_id: 'MIG2602',
      display_order: 2,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n1111111-3333-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Zainab Alabi',
      slug: 'zainab-alabi',
      description: 'Environmental sustainability activist promoting eco-tourism, clean city programs, and hill conservation.',
      image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
      public_id: 'MIG2603',
      display_order: 3,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n1111111-4444-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-2222-1111-1111-111111111111',
      name: 'Victoria Adeyemi',
      slug: 'victoria-adeyemi',
      description: 'Curator of indigenous folklore, spoken word poet, and cultural ambassador for youth festivals.',
      image_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
      public_id: 'MIG2604',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // --- Mr Igbeti 2026 Contestants ---
    {
      id: 'n2222222-1111-1111-1111-111111111111',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      category_id: 'c2222222-1111-1111-1111-111111111111',
      name: 'Babatunde Adeleke',
      slug: 'babatunde-adeleke',
      description: 'Software engineer and youth tech mentor organizing code clubs and computer literacy for secondary schools.',
      image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
      public_id: 'MRIG01',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n2222222-2222-1111-1111-111111111111',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      category_id: 'c2222222-1111-1111-1111-111111111111',
      name: 'David Oladimeji',
      slug: 'david-oladimeji',
      description: 'Medical student, health advocate, and leader in blood donation awareness campaigns.',
      image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
      public_id: 'MRIG02',
      display_order: 2,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // --- MC Icon Contestants ---
    {
      id: 'n3333333-1111-1111-1111-111111111111',
      event_id: 'e3333333-3333-3333-3333-333333333333',
      category_id: 'c3333333-1111-1111-1111-111111111111',
      name: 'MC Oloye Hypeman',
      slug: 'mc-oloye-hypeman',
      description: 'Dynamic host known for keeping energy levels high at corporate summits and campus mega concerts.',
      image_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
      public_id: 'MC001',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // --- Best Teacher Contestants ---
    {
      id: 'n4444444-1111-1111-1111-111111111111',
      event_id: 'e4444444-4444-4444-4444-444444444444',
      category_id: 'c4444444-1111-1111-1111-111111111111',
      name: 'Mr. Emmanuel Babalola',
      slug: 'emmanuel-babalola',
      description: 'Physics & Mathematics master with 14 years of mentorship and numerous Olympiad medal-winning students.',
      image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80',
      public_id: 'TEA01',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // --- Best Photographer (Closed Champion) ---
    {
      id: 'n5555555-1111-1111-1111-111111111111',
      event_id: 'e5555555-5555-5555-5555-555555555555',
      category_id: 'c5555555-1111-1111-1111-111111111111',
      name: 'Samuel Adekunle Visuals',
      slug: 'samuel-adekunle-visuals',
      description: 'Celebrated documentary artist capturing the heritage of marble rocks, sunrise vistas, and local artisans.',
      image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
      public_id: 'PHT01',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n-pen1-1',
      event_id: 'e-pending-1',
      category_id: 'c-pen1-1',
      name: 'Tobi Johnson',
      slug: 'tobi-johnson',
      description: 'Founder of CampusDelivery app solving logistics on student campuses.',
      image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
      public_id: 'CAMP01',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  votePackages: [],
  votes: [
    {
      id: 'v-seed-1',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-1111-1111-1111-111111111111',
      nominee_id: 'n1111111-1111-1111-1111-111111111111',
      voter_email: 'supporter1@example.com',
      quantity: 12450,
      unit_price: 100,
      total_amount: 1245000,
      currency: 'NGN',
      payment_id: 'pay-seed-1',
      payment_reference: 'JVA-SEED-1001',
      status: 'confirmed',
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      id: 'v-seed-2',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-1111-1111-1111-111111111111',
      nominee_id: 'n1111111-2222-1111-1111-111111111111',
      voter_email: 'supporter2@example.com',
      quantity: 9820,
      unit_price: 100,
      total_amount: 982000,
      currency: 'NGN',
      payment_id: 'pay-seed-2',
      payment_reference: 'JVA-SEED-1002',
      status: 'confirmed',
      created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    },
    {
      id: 'v-seed-3',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-1111-1111-1111-111111111111',
      nominee_id: 'n1111111-3333-1111-1111-111111111111',
      voter_email: 'supporter3@example.com',
      quantity: 7450,
      unit_price: 100,
      total_amount: 745000,
      currency: 'NGN',
      payment_id: 'pay-seed-3',
      payment_reference: 'JVA-SEED-1003',
      status: 'confirmed',
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'v-seed-4',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-2222-1111-1111-111111111111',
      nominee_id: 'n1111111-4444-1111-1111-111111111111',
      voter_email: 'supporter4@example.com',
      quantity: 5200,
      unit_price: 100,
      total_amount: 520000,
      currency: 'NGN',
      payment_id: 'pay-seed-4',
      payment_reference: 'JVA-SEED-1004',
      status: 'confirmed',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 'v-seed-5',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      category_id: 'c2222222-1111-1111-1111-111111111111',
      nominee_id: 'n2222222-1111-1111-1111-111111111111',
      voter_email: 'techfan@example.com',
      quantity: 8640,
      unit_price: 100,
      total_amount: 864000,
      currency: 'NGN',
      payment_id: 'pay-seed-5',
      payment_reference: 'JVA-SEED-1005',
      status: 'confirmed',
      created_at: new Date(Date.now() - 30 * 3600000).toISOString(),
    },
    {
      id: 'v-seed-6',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      category_id: 'c2222222-1111-1111-1111-111111111111',
      nominee_id: 'n2222222-2222-1111-1111-111111111111',
      voter_email: 'medfan@example.com',
      quantity: 6810,
      unit_price: 100,
      total_amount: 681000,
      currency: 'NGN',
      payment_id: 'pay-seed-6',
      payment_reference: 'JVA-SEED-1006',
      status: 'confirmed',
      created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    },
    {
      id: 'v-seed-7',
      event_id: 'e3333333-3333-3333-3333-333333333333',
      category_id: 'c3333333-1111-1111-1111-111111111111',
      nominee_id: 'n3333333-1111-1111-1111-111111111111',
      voter_email: 'mcfan@example.com',
      quantity: 11200,
      unit_price: 100,
      total_amount: 1120000,
      currency: 'NGN',
      payment_id: 'pay-seed-7',
      payment_reference: 'JVA-SEED-1007',
      status: 'confirmed',
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    },
    {
      id: 'v-seed-8',
      event_id: 'e4444444-4444-4444-4444-444444444444',
      category_id: 'c4444444-1111-1111-1111-111111111111',
      nominee_id: 'n4444444-1111-1111-1111-111111111111',
      voter_email: 'alumni@example.com',
      quantity: 14850,
      unit_price: 100,
      total_amount: 1485000,
      currency: 'NGN',
      payment_id: 'pay-seed-8',
      payment_reference: 'JVA-SEED-1008',
      status: 'confirmed',
      created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    },
    {
      id: 'v-seed-9',
      event_id: 'e5555555-5555-5555-5555-555555555555',
      category_id: 'c5555555-1111-1111-1111-111111111111',
      nominee_id: 'n5555555-1111-1111-1111-111111111111',
      voter_email: 'artfan@example.com',
      quantity: 18450,
      unit_price: 100,
      total_amount: 1845000,
      currency: 'NGN',
      payment_id: 'pay-seed-9',
      payment_reference: 'JVA-SEED-1009',
      status: 'confirmed',
      created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    },
  ],
  payments: [
    {
      id: 'pay-seed-1',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      voter_email: 'supporter1@example.com',
      amount: 1245000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1001',
      gateway_reference: 'TP-GW-SEED-1001',
      gateway: 'transactpay',
      status: 'successful',
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      id: 'pay-seed-2',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      voter_email: 'supporter2@example.com',
      amount: 982000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1002',
      gateway_reference: 'TP-GW-SEED-1002',
      gateway: 'transactpay',
      status: 'successful',
      created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    },
    {
      id: 'pay-seed-3',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      voter_email: 'supporter3@example.com',
      amount: 745000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1003',
      gateway_reference: 'TP-GW-SEED-1003',
      gateway: 'transactpay',
      status: 'successful',
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'pay-seed-4',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      voter_email: 'supporter4@example.com',
      amount: 520000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1004',
      gateway_reference: 'TP-GW-SEED-1004',
      gateway: 'transactpay',
      status: 'successful',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 'pay-seed-5',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      voter_email: 'techfan@example.com',
      amount: 864000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1005',
      gateway_reference: 'TP-GW-SEED-1005',
      gateway: 'transactpay',
      status: 'successful',
      created_at: new Date(Date.now() - 30 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 3600000).toISOString(),
    },
    {
      id: 'pay-seed-6',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      voter_email: 'medfan@example.com',
      amount: 681000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1006',
      gateway_reference: 'TP-GW-SEED-1006',
      gateway: 'transactpay',
      status: 'successful',
      created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    },
    {
      id: 'pay-seed-7',
      event_id: 'e3333333-3333-3333-3333-333333333333',
      voter_email: 'mcfan@example.com',
      amount: 1120000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1007',
      gateway_reference: 'TP-GW-SEED-1007',
      gateway: 'transactpay',
      status: 'successful',
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    },
    {
      id: 'pay-seed-8',
      event_id: 'e4444444-4444-4444-4444-444444444444',
      voter_email: 'alumni@example.com',
      amount: 1485000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1008',
      gateway_reference: 'TP-GW-SEED-1008',
      gateway: 'transactpay',
      status: 'successful',
      created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    },
    {
      id: 'pay-seed-9',
      event_id: 'e5555555-5555-5555-5555-555555555555',
      voter_email: 'artfan@example.com',
      amount: 1845000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1009',
      gateway_reference: 'TP-GW-SEED-1009',
      gateway: 'transactpay',
      status: 'successful',
      created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    },
  ],
  receipts: [
    {
      id: 'rec-seed-1',
      vote_id: 'v-seed-1',
      receipt_number: 'REC-2026-194820',
      public_id: 'rc_igbeti_001',
      voter_email: 'supporter1@example.com',
      amount: 1245000,
      currency: 'NGN',
      issued_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      email_status: 'sent',
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
  ],
  applications: [
    {
      id: 'app-seed-1',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-1111-1111-1111-111111111111',
      full_name: 'Omotola Adesina',
      email: 'omotola.adesina@gmail.com',
      phone: '+234 812 345 6789',
      bio: 'Cultural heritage advocate and 400L Biochemistry undergraduate passionate about female education in Oyo State.',
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      instagram_handle: '@omotola_crown',
      reason_to_win: 'I want to build a mentorship initiative for young girls across Igbeti marble city.',
      status: 'pending',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 'app-seed-2',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-1111-1111-1111-111111111111',
      full_name: 'Zainab Balogun',
      email: 'zainab.b@yahoo.com',
      phone: '+234 803 987 6543',
      bio: 'Fashion designer and community development volunteer.',
      image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
      instagram_handle: '@zee_balogun',
      reason_to_win: 'Showcasing our indigenous marble textile artistry on national stages.',
      status: 'pending',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
  ],
  ledger: [
    {
      id: 'led-1',
      transaction_id: 'pay-seed-1',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      event_name: 'Miss Igbeti 2026',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      voter_email: 'supporter1@example.com',
      gross_amount: 1245000,
      platform_fee: 124500, // 10%
      organizer_amount: 1120500, // 90%
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1001',
      status: 'verified',
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      id: 'led-2',
      transaction_id: 'pay-seed-2',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      event_name: 'Miss Igbeti 2026',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      voter_email: 'supporter2@example.com',
      gross_amount: 982000,
      platform_fee: 98200,
      organizer_amount: 883800,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1002',
      status: 'verified',
      created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    },
    {
      id: 'led-3',
      transaction_id: 'pay-seed-3',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      event_name: 'Miss Igbeti 2026',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      voter_email: 'supporter3@example.com',
      gross_amount: 745000,
      platform_fee: 74500,
      organizer_amount: 670500,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1003',
      status: 'verified',
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'led-4',
      transaction_id: 'pay-seed-4',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      event_name: 'Miss Igbeti 2026',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      voter_email: 'supporter4@example.com',
      gross_amount: 520000,
      platform_fee: 52000,
      organizer_amount: 468000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1004',
      status: 'verified',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 'led-5',
      transaction_id: 'pay-seed-5',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      event_name: 'Mr Igbeti 2026',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      voter_email: 'techfan@example.com',
      gross_amount: 864000,
      platform_fee: 86400,
      organizer_amount: 777600,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1005',
      status: 'verified',
      created_at: new Date(Date.now() - 30 * 3600000).toISOString(),
    },
    {
      id: 'led-6',
      transaction_id: 'pay-seed-6',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      event_name: 'Mr Igbeti 2026',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      voter_email: 'medfan@example.com',
      gross_amount: 681000,
      platform_fee: 68100,
      organizer_amount: 612900,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1006',
      status: 'verified',
      created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    },
    {
      id: 'led-7',
      transaction_id: 'pay-seed-7',
      event_id: 'e3333333-3333-3333-3333-333333333333',
      event_name: 'MC Icon Igbeti 2026',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      voter_email: 'mcfan@example.com',
      gross_amount: 1120000,
      platform_fee: 112000,
      organizer_amount: 1008000,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1007',
      status: 'verified',
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    },
    {
      id: 'led-8',
      transaction_id: 'pay-seed-8',
      event_id: 'e4444444-4444-4444-4444-444444444444',
      event_name: 'Best Teacher Igbeti 2026',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      voter_email: 'alumni@example.com',
      gross_amount: 1485000,
      platform_fee: 148500,
      organizer_amount: 1336500,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1008',
      status: 'verified',
      created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    },
    {
      id: 'led-9',
      transaction_id: 'pay-seed-9',
      event_id: 'e5555555-5555-5555-5555-555555555555',
      event_name: 'Best Photographer Igbeti 2026',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      voter_email: 'artfan@example.com',
      gross_amount: 1845000,
      platform_fee: 184500,
      organizer_amount: 1660500,
      currency: 'NGN',
      payment_reference: 'JVA-SEED-1009',
      status: 'verified',
      created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    },
  ],
  withdrawals: [
    {
      id: 'WD-82931',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      organizer_email: 'organizer@igbetitourism.org',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      event_name: 'Miss Igbeti 2026',
      amount: 1500000,
      currency: 'NGN',
      payout_bank: 'First Bank of Nigeria',
      payout_account_number: '3098124578',
      payout_account_name: 'Igbeti Tourism & Cultural Committee',
      status: 'completed',
      admin_id: 'admin-0000-0000-0000-000000000000',
      approved_at: new Date(Date.now() - 40 * 3600000).toISOString(),
      completed_at: new Date(Date.now() - 38 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 44 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 38 * 3600000).toISOString(),
    },
    {
      id: 'WD-82944',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      organizer_email: 'organizer@igbetitourism.org',
      event_id: 'e5555555-5555-5555-5555-555555555555',
      event_name: 'Best Photographer Igbeti 2026',
      amount: 1200000,
      currency: 'NGN',
      payout_bank: 'Kuda Microfinance Bank',
      payout_account_number: '2001928341',
      payout_account_name: 'Creative Lens Studio Ltd',
      status: 'completed',
      admin_id: 'admin-0000-0000-0000-000000000000',
      approved_at: new Date(Date.now() - 60 * 3600000).toISOString(),
      completed_at: new Date(Date.now() - 58 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 64 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 58 * 3600000).toISOString(),
    },
    {
      id: 'WD-99412',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      organizer_name: 'Igbeti Tourism Board',
      organizer_email: 'organizer@igbetitourism.org',
      event_id: 'e4444444-4444-4444-4444-444444444444',
      event_name: 'Best Teacher Igbeti 2026',
      amount: 800000,
      currency: 'NGN',
      payout_bank: 'Access Bank',
      payout_account_number: '0718294012',
      payout_account_name: 'Igbeti Education Trust',
      status: 'pending_approval',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
  ],
  auditLogs: [
    {
      id: 'aud-1',
      admin_id: 'admin-0000-0000-0000-000000000000',
      admin_name: 'Super Admin',
      admin_email: 'admin@jvican.com',
      action: 'ADMIN_APPROVED_EVENT',
      target_type: 'event',
      target_id: 'e1111111-1111-1111-1111-111111111111',
      target_name: 'Miss Igbeti 2026',
      previous_state: 'pending_approval',
      new_state: 'published',
      reason: 'Organizing documents and banking details fully verified.',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'aud-2',
      admin_id: 'admin-0000-0000-0000-000000000000',
      admin_name: 'Super Admin',
      admin_email: 'admin@jvican.com',
      action: 'ADMIN_COMPLETED_WITHDRAWAL',
      target_type: 'withdrawal',
      target_id: 'WD-82931',
      target_name: 'Withdrawal ₦1,500,000 for Miss Igbeti',
      previous_state: 'processing',
      new_state: 'completed',
      reason: 'Automated settlement reference acknowledged by CBN switch.',
      created_at: new Date(Date.now() - 38 * 3600000).toISOString(),
    },
    {
      id: 'aud-3',
      admin_id: 'org-11111111-1111',
      admin_name: 'Igbeti Tourism Board',
      admin_email: 'organizer@igbetitourism.org',
      action: 'ORGANIZER_REQUESTED_WITHDRAWAL',
      target_type: 'withdrawal',
      target_id: 'WD-99412',
      target_name: 'Withdrawal ₦800,000 for Best Teacher 2026',
      previous_state: 'none',
      new_state: 'pending_approval',
      reason: 'Mid-competition organizer disbursement request.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
  ],
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
