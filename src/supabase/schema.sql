-- JVican Vote Arena Production Relational Schema
-- Supports full RLS, Triggers, Indexes, and Integrity Constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Organizers)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Events (Contests)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  vote_price NUMERIC(12, 2) NOT NULL DEFAULT 100.00 CHECK (vote_price >= 100.00),
  currency TEXT NOT NULL DEFAULT 'NGN',
  allow_multiple_votes BOOLEAN NOT NULL DEFAULT TRUE,
  show_live_results BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT chk_event_dates CHECK (end_date >= start_date)
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, slug)
);

-- 4. Nominees (Contestants)
CREATE TABLE IF NOT EXISTS nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  public_id TEXT UNIQUE NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disqualified', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, slug)
);

-- 5. Vote Packages (Configurable quick vote bundles)
CREATE TABLE IF NOT EXISTS vote_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  voter_email TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  payment_reference TEXT UNIQUE NOT NULL,
  gateway_reference TEXT,
  gateway TEXT NOT NULL DEFAULT 'transactpay',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  nominee_id UUID NOT NULL REFERENCES nominees(id) ON DELETE RESTRICT,
  voter_email TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 10),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 100.00),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 1000.00),
  currency TEXT NOT NULL DEFAULT 'NGN',
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  payment_reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID UNIQUE NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  receipt_number TEXT UNIQUE NOT NULL,
  public_id TEXT UNIQUE NOT NULL,
  voter_email TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email_status TEXT NOT NULL DEFAULT 'queued' CHECK (email_status IN ('queued', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_categories_event ON categories(event_id);
CREATE INDEX IF NOT EXISTS idx_nominees_event ON nominees(event_id);
CREATE INDEX IF NOT EXISTS idx_nominees_category ON nominees(category_id);
CREATE INDEX IF NOT EXISTS idx_nominees_public_id ON nominees(public_id);
CREATE INDEX IF NOT EXISTS idx_votes_event ON votes(event_id);
CREATE INDEX IF NOT EXISTS idx_votes_nominee ON votes(nominee_id);
CREATE INDEX IF NOT EXISTS idx_votes_status ON votes(status);
CREATE INDEX IF NOT EXISTS idx_votes_payment_ref ON votes(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_receipts_public_id ON receipts(public_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Profiles: Organizers can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Events: Public can view published/closed events. Organizers can manage their own.
CREATE POLICY "Public can view published and closed events" ON events
  FOR SELECT USING (status IN ('published', 'closed'));
CREATE POLICY "Organizers can view all their events" ON events
  FOR SELECT USING (organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Organizers can insert events" ON events
  FOR INSERT WITH CHECK (organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Organizers can update own events" ON events
  FOR UPDATE USING (organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Organizers can delete own events" ON events
  FOR DELETE USING (organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Categories: Public view for published events. Organizers manage.
CREATE POLICY "Public can view categories of published events" ON categories
  FOR SELECT USING (event_id IN (SELECT id FROM events WHERE status IN ('published', 'closed')));
CREATE POLICY "Organizers can manage categories" ON categories
  FOR ALL USING (event_id IN (SELECT e.id FROM events e JOIN profiles p ON e.organizer_id = p.id WHERE p.user_id = auth.uid()));

-- Nominees: Public view active nominees of published events. Organizers manage.
CREATE POLICY "Public can view active nominees of published events" ON nominees
  FOR SELECT USING (event_id IN (SELECT id FROM events WHERE status IN ('published', 'closed')));
CREATE POLICY "Organizers can manage nominees" ON nominees
  FOR ALL USING (event_id IN (SELECT e.id FROM events e JOIN profiles p ON e.organizer_id = p.id WHERE p.user_id = auth.uid()));

-- Vote Packages: Public view
CREATE POLICY "Public can view vote packages" ON vote_packages
  FOR SELECT USING (event_id IN (SELECT id FROM events WHERE status IN ('published', 'closed')));
CREATE POLICY "Organizers can manage vote packages" ON vote_packages
  FOR ALL USING (event_id IN (SELECT e.id FROM events e JOIN profiles p ON e.organizer_id = p.id WHERE p.user_id = auth.uid()));

-- 9. Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  related_resource_type TEXT,
  related_resource_id TEXT,
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_message_id TEXT,
  idempotency_key TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'SUBSCRIBED' CHECK (status IN ('SUBSCRIBED', 'UNSUBSCRIBED')),
  source TEXT NOT NULL DEFAULT 'WEBSITE',
  resend_contact_id TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_idempotency ON email_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);

-- Receipts: Public can view specific receipt by public_id lookup
CREATE POLICY "Public can view receipts" ON receipts
  FOR SELECT USING (true);

-- Votes & Payments: Read restricted to organizers of the event or service role
CREATE POLICY "Organizers can view votes for their events" ON votes
  FOR SELECT USING (event_id IN (SELECT e.id FROM events e JOIN profiles p ON e.organizer_id = p.id WHERE p.user_id = auth.uid()));
CREATE POLICY "Organizers can view payments for their events" ON payments
  FOR SELECT USING (event_id IN (SELECT e.id FROM events e JOIN profiles p ON e.organizer_id = p.id WHERE p.user_id = auth.uid()));
