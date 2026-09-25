-- ==============================================================================
-- JVICAN VOTE ARENA - SUPABASE DATABASE SCHEMA & POLICIES
-- Paste this script into your Supabase Dashboard -> SQL Editor and click "Run"
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Organizers & Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'organizer' CHECK (role IN ('organizer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. EVENTS TABLE (Contests)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organizer_name TEXT,
  organizer_email TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'closed', 'rejected', 'archived')),
  rejection_reason TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  vote_price NUMERIC(12, 2) DEFAULT 100.00 NOT NULL CHECK (vote_price >= 100.00),
  currency TEXT DEFAULT 'NGN' NOT NULL,
  allow_multiple_votes BOOLEAN DEFAULT TRUE NOT NULL,
  show_live_results BOOLEAN DEFAULT TRUE NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  display_order INT DEFAULT 0,
  payout_bank TEXT,
  payout_account_number TEXT,
  payout_account_name TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT chk_event_dates CHECK (end_date >= start_date)
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(event_id, slug)
);

-- 4. NOMINEES TABLE (Contestants)
CREATE TABLE IF NOT EXISTS public.nominees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  public_id TEXT NOT NULL,
  display_order INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disqualified', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(event_id, slug)
);

-- 5. VOTE PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.vote_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. PAYMENTS TABLE (TransactPay Gateways)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  voter_email TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'NGN' NOT NULL,
  payment_reference TEXT NOT NULL UNIQUE,
  gateway_reference TEXT,
  gateway TEXT DEFAULT 'transactpay' NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. VOTES TABLE
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  nominee_id UUID REFERENCES public.nominees(id) ON DELETE CASCADE NOT NULL,
  voter_email TEXT NOT NULL,
  quantity INT DEFAULT 10 NOT NULL CHECK (quantity >= 10),
  unit_price NUMERIC(12, 2) DEFAULT 100.00 NOT NULL CHECK (unit_price >= 100.00),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 1000.00),
  currency TEXT DEFAULT 'NGN' NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  payment_reference TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vote_id UUID REFERENCES public.votes(id) ON DELETE CASCADE NOT NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  public_id TEXT NOT NULL UNIQUE,
  voter_email TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN' NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email_status TEXT DEFAULT 'queued' CHECK (email_status IN ('queued', 'sent', 'failed')),
  email_sent_at TIMESTAMPTZ,
  email_idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. NOMINEE APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.nominee_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  instagram_handle TEXT,
  reason_to_win TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. WITHDRAWAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  event_name TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN' NOT NULL,
  payout_bank TEXT NOT NULL,
  payout_account_number TEXT NOT NULL,
  payout_account_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('requested', 'pending_approval', 'approved', 'processing', 'completed', 'rejected', 'failed')),
  rejection_reason TEXT,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. FINANCIAL LEDGER TABLE (Immutable Accounting)
CREATE TABLE IF NOT EXISTS public.financial_ledger (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  event_name TEXT NOT NULL,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organizer_name TEXT NOT NULL,
  voter_email TEXT NOT NULL,
  gross_amount NUMERIC(12, 2) NOT NULL,
  platform_fee NUMERIC(12, 2) NOT NULL, -- 10% JVican Platform Cut
  organizer_amount NUMERIC(12, 2) NOT NULL, -- 90% Net to Organizer
  currency TEXT DEFAULT 'NGN' NOT NULL,
  payment_reference TEXT NOT NULL,
  status TEXT DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_name TEXT,
  previous_state TEXT,
  new_state TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 13. PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  platform_fee_percent NUMERIC(5, 2) DEFAULT 10.00 NOT NULL,
  payout_delay_hours INT DEFAULT 24 NOT NULL,
  minimum_withdrawal_amount NUMERIC(12, 2) DEFAULT 1000.00 NOT NULL,
  maintenance_mode BOOLEAN DEFAULT FALSE NOT NULL,
  require_manual_event_approval BOOLEAN DEFAULT TRUE NOT NULL,
  settlement_gateway TEXT DEFAULT 'TransactPay Auto-Settlement Engine' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Seed default settings
INSERT INTO public.platform_settings (id, platform_fee_percent, payout_delay_hours, minimum_withdrawal_amount, maintenance_mode, require_manual_event_approval, settlement_gateway)
VALUES (1, 10.00, 24, 1000.00, FALSE, TRUE, 'TransactPay Auto-Settlement Engine')
ON CONFLICT (id) DO NOTHING;

-- 14. EMAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  related_resource_type TEXT,
  related_resource_id TEXT,
  provider TEXT DEFAULT 'resend' NOT NULL,
  provider_message_id TEXT,
  idempotency_key TEXT UNIQUE,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  attempt_count INT DEFAULT 1,
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 15. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'SUBSCRIBED' CHECK (status IN ('SUBSCRIBED', 'UNSUBSCRIBED')),
  source TEXT DEFAULT 'WEBSITE',
  resend_contact_id TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_categories_event ON public.categories(event_id);
CREATE INDEX IF NOT EXISTS idx_nominees_event ON public.nominees(event_id);
CREATE INDEX IF NOT EXISTS idx_nominees_category ON public.nominees(category_id);
CREATE INDEX IF NOT EXISTS idx_nominees_public_id ON public.nominees(public_id);
CREATE INDEX IF NOT EXISTS idx_votes_event ON public.votes(event_id);
CREATE INDEX IF NOT EXISTS idx_votes_nominee ON public.votes(nominee_id);
CREATE INDEX IF NOT EXISTS idx_votes_status ON public.votes(status);
CREATE INDEX IF NOT EXISTS idx_votes_payment_ref ON public.votes(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON public.payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_receipts_public_id ON public.receipts(public_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_event ON public.financial_ledger(event_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_organizer ON public.financial_ledger(organizer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_idempotency ON public.email_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter_subscribers(status);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominee_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public Access Policies
CREATE POLICY "Public can read approved published events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can read nominees" ON public.nominees FOR SELECT USING (true);
CREATE POLICY "Public can read vote packages" ON public.vote_packages FOR SELECT USING (true);
CREATE POLICY "Public can read confirmed votes count" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Public can insert votes" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view receipt by public_id" ON public.receipts FOR SELECT USING (true);
CREATE POLICY "Public can submit nominee application" ON public.nominee_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read platform settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Authenticated Users Policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Organizers Policies
CREATE POLICY "Organizers can insert events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can view own withdrawals" ON public.withdrawal_requests FOR SELECT USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can insert withdrawals" ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Service Role Policies (Server actions & webhooks)
CREATE POLICY "Service role manages email logs" ON public.email_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role manages newsletter subscribers" ON public.newsletter_subscribers FOR ALL USING (auth.role() = 'service_role');

-- Automatic Profile Creation Trigger on Auth Sign-Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    CASE WHEN LOWER(new.email) = 'admin@jvican.com' THEN 'admin' ELSE 'organizer' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
