-- JVican Vote Arena Seed Data (5 Featured Igbeti 2026 Contests + Categories + Contestants + Packages)

-- 1. Demo Organizer Profile
INSERT INTO profiles (id, full_name, email, avatar_url, phone)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Igbeti Events & Tourism Board',
  'organizer@igbetitourism.org',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  '+2348012345678'
) ON CONFLICT (id) DO NOTHING;

-- 2. Contest 1: Miss Igbeti 2026
INSERT INTO events (id, organizer_id, name, slug, description, logo_url, cover_image_url, status, start_date, end_date, vote_price, currency, allow_multiple_votes, show_live_results, is_featured, display_order)
VALUES (
  'e1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Miss Igbeti 2026',
  'miss-igbeti-2026',
  'The premier beauty and cultural pageant celebrating intelligence, grace, and heritage of marble city queens.',
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80',
  'published',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '12 days',
  100.00,
  'NGN',
  TRUE,
  TRUE,
  TRUE,
  1
) ON CONFLICT (id) DO NOTHING;

-- Contest 2: Mr Igbeti 2026
INSERT INTO events (id, organizer_id, name, slug, description, logo_url, cover_image_url, status, start_date, end_date, vote_price, currency, allow_multiple_votes, show_live_results, is_featured, display_order)
VALUES (
  'e2222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Mr Igbeti 2026',
  'mr-igbeti-2026',
  'Annual leadership, youth excellence, and charismatic gentleman competition.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=80',
  'published',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '15 days',
  100.00,
  'NGN',
  TRUE,
  TRUE,
  TRUE,
  2
) ON CONFLICT (id) DO NOTHING;

-- Contest 3: MC Icon Igbeti 2026
INSERT INTO events (id, organizer_id, name, slug, description, logo_url, cover_image_url, status, start_date, end_date, vote_price, currency, allow_multiple_votes, show_live_results, is_featured, display_order)
VALUES (
  'e3333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'MC Icon Igbeti 2026',
  'mc-icon-igbeti-2026',
  'Recognizing the top event hosts, hype masters, and master of ceremonies electrifying audiences across the region.',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&auto=format&fit=crop&q=80',
  'published',
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '18 days',
  100.00,
  'NGN',
  TRUE,
  TRUE,
  TRUE,
  3
) ON CONFLICT (id) DO NOTHING;

-- Contest 4: Best Teacher Igbeti 2026
INSERT INTO events (id, organizer_id, name, slug, description, logo_url, cover_image_url, status, start_date, end_date, vote_price, currency, allow_multiple_votes, show_live_results, is_featured, display_order)
VALUES (
  'e4444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Best Teacher Igbeti 2026',
  'best-teacher-igbeti-2026',
  'Honoring outstanding educators shaping minds, building character, and empowering the next generation.',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80',
  'published',
  NOW() - INTERVAL '1 days',
  NOW() + INTERVAL '20 days',
  100.00,
  'NGN',
  TRUE,
  TRUE,
  TRUE,
  4
) ON CONFLICT (id) DO NOTHING;

-- Contest 5: Best Photographer Igbeti 2026
INSERT INTO events (id, organizer_id, name, slug, description, logo_url, cover_image_url, status, start_date, end_date, vote_price, currency, allow_multiple_votes, show_live_results, is_featured, display_order)
VALUES (
  'e5555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'Best Photographer Igbeti 2026',
  'best-photographer-igbeti-2026',
  'Celebrating visual storytellers capturing culture, emotion, and landscapes through creative lenses.',
  'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600&auto=format&fit=crop&q=80',
  'published',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '1 days', -- Concluded contest to showcase /winners
  100.00,
  'NGN',
  TRUE,
  TRUE,
  TRUE,
  5
) ON CONFLICT (id) DO NOTHING;

-- 3. Categories for Miss Igbeti 2026
INSERT INTO categories (id, event_id, name, slug, description, display_order)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Overall Crown Queen', 'overall-crown-queen', 'The supreme title holder representing Igbeti heritage', 1),
  ('c1111111-2222-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Miss Culture & Tourism', 'miss-culture-tourism', 'Ambassador for eco-tourism and hills preservation', 2)
ON CONFLICT (id) DO NOTHING;

-- 4. Contestants for Miss Igbeti 2026
INSERT INTO nominees (id, event_id, category_id, name, slug, description, image_url, public_id, display_order, status)
VALUES
  ('n1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Adebisi Folashade', 'adebisi-folashade', 'Biochemistry undergraduate, advocate for girl-child education in rural communities.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80', 'MIG2601', 1, 'active'),
  ('n1111111-2222-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Oluwaseun Kehinde', 'oluwaseun-kehinde', 'Entrepreneur, fashion designer, and cultural enthusiast dedicated to youth empowerment.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80', 'MIG2602', 2, 'active'),
  ('n1111111-3333-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Zainab Alabi', 'zainab-alabi', 'Environmental sustainability activist promoting cleanliness and tourism development.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80', 'MIG2603', 3, 'active'),
  ('n1111111-4444-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'c1111111-2222-1111-1111-111111111111', 'Blessing Oladipo', 'blessing-oladipo', 'Poet and traditional performing artist championing Yoruba oral literature.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80', 'MIG2604', 4, 'active')
ON CONFLICT (id) DO NOTHING;

-- 5. Vote Packages for Miss Igbeti 2026
INSERT INTO vote_packages (event_id, label, quantity, display_order)
VALUES
  ('e1111111-1111-1111-1111-111111111111', '1 Vote', 1, 1),
  ('e1111111-1111-1111-1111-111111111111', '5 Votes', 5, 2),
  ('e1111111-1111-1111-1111-111111111111', '10 Votes', 10, 3),
  ('e1111111-1111-1111-1111-111111111111', '20 Votes', 20, 4),
  ('e1111111-1111-1111-1111-111111111111', '50 Votes', 50, 5),
  ('e1111111-1111-1111-1111-111111111111', '100 Votes', 100, 6)
ON CONFLICT DO NOTHING;
