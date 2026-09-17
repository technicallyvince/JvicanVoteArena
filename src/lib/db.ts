import { Event, Category, Nominee, VotePackage, Vote, Payment, Receipt } from '@/types/database'

export interface MockStore {
  events: Event[]
  categories: Category[]
  nominees: Nominee[]
  votePackages: VotePackage[]
  votes: Vote[]
  payments: Payment[]
  receipts: Receipt[]
}

// Global in-memory cache for seamless full demo functionality when Supabase connection is in dev mode
let mockStore: MockStore = {
  events: [
    {
      id: 'e1111111-1111-1111-1111-111111111111',
      organizer_id: '11111111-1111-1111-1111-111111111111',
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e2222222-2222-2222-2222-222222222222',
      organizer_id: '11111111-1111-1111-1111-111111111111',
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e3333333-3333-3333-3333-333333333333',
      organizer_id: '11111111-1111-1111-1111-111111111111',
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e4444444-4444-4444-4444-444444444444',
      organizer_id: '11111111-1111-1111-1111-111111111111',
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e5555555-5555-5555-5555-555555555555',
      organizer_id: '11111111-1111-1111-1111-111111111111',
      name: 'Best Photographer Igbeti 2026',
      slug: 'best-photographer-igbeti-2026',
      description: 'Celebrating visual storytellers capturing culture, emotion, and landscapes through creative artistic lenses.',
      logo_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600&auto=format&fit=crop&q=80',
      status: 'closed', // Concluded contest for /winners section
      start_date: new Date(Date.now() - 25 * 86400000).toISOString(),
      end_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      vote_price: 100,
      currency: 'NGN',
      allow_multiple_votes: true,
      show_live_results: true,
      is_featured: true,
      display_order: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
      name: 'Blessing Oladipo',
      slug: 'blessing-oladipo',
      description: 'Poet and traditional performing artist championing Yoruba oral literature and contemporary cultural theatre.',
      image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
      public_id: 'MIG2604',
      display_order: 4,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // --- Mr Igbeti 2026 Contestants ---
    {
      id: 'n2222222-1111-1111-1111-111111111111',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      category_id: 'c2222222-1111-1111-1111-111111111111',
      name: 'Michael Vince Adeleke',
      slug: 'michael-vince-adeleke',
      description: 'Software engineer and youth mentor driving digital literacy and tech skills training for secondary school students.',
      image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
      public_id: 'MRI2601',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n2222222-2222-1111-1111-111111111111',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      category_id: 'c2222222-1111-1111-1111-111111111111',
      name: 'Dr. David Oladiran',
      slug: 'david-oladiran',
      description: 'Resident medical officer organizing free rural health checkups and cardiovascular health awareness campaigns.',
      image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
      public_id: 'MRI2602',
      display_order: 2,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n2222222-3333-1111-1111-111111111111',
      event_id: 'e2222222-2222-2222-2222-222222222222',
      category_id: 'c2222222-2222-1111-1111-111111111111',
      name: 'Ayomide Emmanuel',
      slug: 'ayomide-emmanuel',
      description: 'Creative director, fitness coach, and community sports organizer inspiring young athletes to reach national ranks.',
      image_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80',
      public_id: 'MRI2603',
      display_order: 3,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // --- MC Icon Igbeti 2026 Contestants ---
    {
      id: 'n3333333-1111-1111-1111-111111111111',
      event_id: 'e3333333-3333-3333-3333-333333333333',
      category_id: 'c3333333-1111-1111-1111-111111111111',
      name: 'MC Lively (Femi Adeleke)',
      slug: 'mc-lively-femi',
      description: 'High-energy master of ceremonies, stand-up comedian, and radio personality commanding crowds with unmatched stage presence.',
      image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
      public_id: 'MCI2601',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n3333333-2222-1111-1111-111111111111',
      event_id: 'e3333333-3333-3333-3333-333333333333',
      category_id: 'c3333333-1111-1111-1111-111111111111',
      name: 'Hypeman Supreme (Tobi King)',
      slug: 'hypeman-supreme-tobi',
      description: 'The pulse of the party, bringing non-stop rhythm, crowd chants, and unforgettable hype to luxury weddings and concerts.',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      public_id: 'MCI2602',
      display_order: 2,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n3333333-3333-1111-1111-111111111111',
      event_id: 'e3333333-3333-3333-3333-333333333333',
      category_id: 'c3333333-1111-1111-1111-111111111111',
      name: 'Queen Anjola (Voice of Grace)',
      slug: 'queen-anjola',
      description: 'Corporate gala host, multilingual presenter, and award ceremony anchor known for eloquence and polished charm.',
      image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
      public_id: 'MCI2603',
      display_order: 3,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // --- Best Teacher Igbeti 2026 Contestants ---
    {
      id: 'n4444444-1111-1111-1111-111111111111',
      event_id: 'e4444444-4444-4444-4444-444444444444',
      category_id: 'c4444444-1111-1111-1111-111111111111',
      name: 'Mr. Samuel Ogunleye',
      slug: 'samuel-ogunleye',
      description: 'Physics and robotics teacher at Igbeti High School whose students consistently win regional STEM Olympiad medals.',
      image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80',
      public_id: 'TEA2601',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n4444444-2222-1111-1111-111111111111',
      event_id: 'e4444444-4444-4444-4444-444444444444',
      category_id: 'c4444444-2222-1111-1111-111111111111',
      name: 'Mrs. Victoria Kolawole',
      slug: 'victoria-kolawole',
      description: 'Senior English literature teacher and debate society patron who has mentored over 500 students into leading universities.',
      image_url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&auto=format&fit=crop&q=80',
      public_id: 'TEA2602',
      display_order: 2,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n4444444-3333-1111-1111-111111111111',
      event_id: 'e4444444-4444-4444-4444-444444444444',
      category_id: 'c4444444-3333-1111-1111-111111111111',
      name: 'Engr. Festus Ajayi',
      slug: 'festus-ajayi',
      description: 'Technical drawing and mathematics specialist pioneering hands-on vocational workshops and coding clubs.',
      image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80',
      public_id: 'TEA2603',
      display_order: 3,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // --- Best Photographer 2026 (Closed Champion Winner) ---
    {
      id: 'n5555555-1111-1111-1111-111111111111',
      event_id: 'e5555555-5555-5555-5555-555555555555',
      category_id: 'c5555555-1111-1111-1111-111111111111',
      name: 'Tunde Bakare Visuals',
      slug: 'tunde-bakare-visuals',
      description: 'Award-winning landscape and documentary photographer who captured the majestic marble hills and culture of Igbeti.',
      image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
      public_id: 'PHO2601',
      display_order: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'n5555555-2222-1111-1111-111111111111',
      event_id: 'e5555555-5555-5555-5555-555555555555',
      category_id: 'c5555555-1111-1111-1111-111111111111',
      name: 'Kemi Lens Studio',
      slug: 'kemi-lens-studio',
      description: 'Portrait artist specializing in traditional bridal aesthetics and emotional wedding photojournalism.',
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      public_id: 'PHO2602',
      display_order: 2,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  votePackages: [
    { id: 'p1', event_id: 'e1111111-1111-1111-1111-111111111111', label: '1 Vote', quantity: 1, display_order: 1, created_at: new Date().toISOString() },
    { id: 'p2', event_id: 'e1111111-1111-1111-1111-111111111111', label: '5 Votes', quantity: 5, display_order: 2, created_at: new Date().toISOString() },
    { id: 'p3', event_id: 'e1111111-1111-1111-1111-111111111111', label: '10 Votes', quantity: 10, display_order: 3, created_at: new Date().toISOString() },
    { id: 'p4', event_id: 'e1111111-1111-1111-1111-111111111111', label: '20 Votes', quantity: 20, display_order: 4, created_at: new Date().toISOString() },
    { id: 'p5', event_id: 'e1111111-1111-1111-1111-111111111111', label: '50 Votes', quantity: 50, display_order: 5, created_at: new Date().toISOString() },
    { id: 'p6', event_id: 'e1111111-1111-1111-1111-111111111111', label: '100 Votes', quantity: 100, display_order: 6, created_at: new Date().toISOString() },
  ],
  votes: [
    // Miss Igbeti 2026 Votes
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

    // Mr Igbeti 2026 Votes
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

    // MC Icon Votes
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

    // Best Teacher Votes
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

    // Best Photographer (Concluded Champion)
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
}

export const db = {
  getEvents: () => mockStore.events,
  getEventBySlug: (slug: string) => mockStore.events.find((e) => e.slug === slug),
  getEventById: (id: string) => mockStore.events.find((e) => e.id === id),
  createEvent: (event: Event) => {
    mockStore.events.push(event)
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

  getVotePackages: (eventId: string) => {
    const customPackages = mockStore.votePackages.filter((p) => p.event_id === eventId)
    if (customPackages.length > 0) {
      return customPackages.sort((a, b) => a.display_order - b.display_order)
    }
    // Default universal packages
    return [
      { id: 'p1', event_id: eventId, label: '1 Vote', quantity: 1, display_order: 1, created_at: new Date().toISOString() },
      { id: 'p2', event_id: eventId, label: '5 Votes', quantity: 5, display_order: 2, created_at: new Date().toISOString() },
      { id: 'p3', event_id: eventId, label: '10 Votes', quantity: 10, display_order: 3, created_at: new Date().toISOString() },
      { id: 'p4', event_id: eventId, label: '20 Votes', quantity: 20, display_order: 4, created_at: new Date().toISOString() },
      { id: 'p5', event_id: eventId, label: '50 Votes', quantity: 50, display_order: 5, created_at: new Date().toISOString() },
      { id: 'p6', event_id: eventId, label: '100 Votes', quantity: 100, display_order: 6, created_at: new Date().toISOString() },
    ]
  },

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
      return v
    }
    return null
  },

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

  getReceiptByPublicId: (publicId: string) => mockStore.receipts.find((r) => r.public_id === publicId),
  getReceiptByVoteId: (voteId: string) => mockStore.receipts.find((r) => r.vote_id === voteId),
  createReceipt: (receipt: Receipt) => {
    mockStore.receipts.push(receipt)
    return receipt
  },

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
}
