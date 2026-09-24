-- ==============================================================================
-- JVICAN VOTE ARENA - SUPABASE DATABASE SCHEMA & POLICIES
-- Paste this script into your Supabase Dashboard -> SQL Editor and click "Run"
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  avatar_url text,
  phone text,
  role text default 'organizer' check (role in ('organizer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. EVENTS TABLE
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  organizer_id uuid references public.profiles(id) on delete cascade,
  organizer_name text,
  organizer_email text,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_image_url text,
  status text default 'pending_approval' check (status in ('draft', 'pending_approval', 'approved', 'published', 'closed', 'rejected', 'archived')),
  rejection_reason text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  vote_price numeric default 50.00 not null,
  currency text default 'NGN' not null,
  allow_multiple_votes boolean default true not null,
  show_live_results boolean default true not null,
  is_featured boolean default false not null,
  display_order integer default 0,
  payout_bank text,
  payout_account_number text,
  payout_account_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  slug text not null,
  description text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. NOMINEES TABLE
create table if not exists public.nominees (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  slug text not null,
  description text,
  image_url text,
  public_id text not null,
  display_order integer default 0,
  status text default 'active' check (status in ('active', 'disqualified', 'withdrawn')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. VOTE PACKAGES TABLE
create table if not exists public.vote_packages (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  label text not null,
  quantity integer not null,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  voter_email text not null,
  amount numeric not null,
  currency text default 'NGN' not null,
  payment_reference text not null unique,
  gateway_reference text,
  gateway text default 'TransactPay' not null,
  status text default 'pending' check (status in ('pending', 'successful', 'failed', 'cancelled')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. VOTES TABLE
create table if not exists public.votes (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  nominee_id uuid references public.nominees(id) on delete cascade not null,
  voter_email text not null,
  quantity integer default 1 not null,
  unit_price numeric default 50.00 not null,
  total_amount numeric not null,
  currency text default 'NGN' not null,
  payment_id uuid references public.payments(id) on delete set null,
  payment_reference text not null,
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'failed', 'cancelled', 'refunded')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. RECEIPTS TABLE
create table if not exists public.receipts (
  id uuid default uuid_generate_v4() primary key,
  vote_id uuid references public.votes(id) on delete cascade not null,
  receipt_number text not null unique,
  public_id text not null,
  voter_email text not null,
  amount numeric not null,
  currency text default 'NGN' not null,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email_status text default 'queued' check (email_status in ('queued', 'sent', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. NOMINEE APPLICATIONS TABLE
create table if not exists public.nominee_applications (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  full_name text not null,
  email text not null,
  phone text not null,
  bio text,
  image_url text,
  instagram_handle text,
  reason_to_win text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. WITHDRAWAL REQUESTS TABLE
create table if not exists public.withdrawal_requests (
  id uuid default uuid_generate_v4() primary key,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  organizer_name text not null,
  organizer_email text not null,
  event_id uuid references public.events(id) on delete set null,
  event_name text,
  amount numeric not null,
  currency text default 'NGN' not null,
  payout_bank text not null,
  payout_account_number text not null,
  payout_account_name text not null,
  status text default 'requested' check (status in ('requested', 'pending_approval', 'approved', 'processing', 'completed', 'rejected', 'failed')),
  rejection_reason text,
  admin_id uuid references public.profiles(id) on delete set null,
  approved_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. FINANCIAL LEDGER TABLE
create table if not exists public.financial_ledger (
  id uuid default uuid_generate_v4() primary key,
  transaction_id text not null,
  event_id uuid references public.events(id) on delete cascade not null,
  event_name text not null,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  organizer_name text not null,
  voter_email text not null,
  gross_amount numeric not null,
  platform_fee numeric not null,
  organizer_amount numeric not null,
  currency text default 'NGN' not null,
  payment_reference text not null,
  status text default 'verified' check (status in ('verified', 'pending', 'reversed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id) on delete set null,
  admin_name text not null,
  admin_email text not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  target_name text,
  previous_state text,
  new_state text,
  reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. PLATFORM SETTINGS TABLE
create table if not exists public.platform_settings (
  id integer primary key default 1,
  platform_fee_percent numeric default 10.00 not null,
  payout_delay_hours integer default 24 not null,
  minimum_withdrawal_amount numeric default 1000.00 not null,
  maintenance_mode boolean default false not null,
  require_manual_event_approval boolean default true not null,
  settlement_gateway text default 'Paystack / Korapay Escrow' not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint single_row check (id = 1)
);

-- Seed default settings
insert into public.platform_settings (id, platform_fee_percent, payout_delay_hours, minimum_withdrawal_amount, maintenance_mode, require_manual_event_approval, settlement_gateway)
values (1, 10.00, 24, 1000.00, false, true, 'TransactPay Escrow')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.categories enable row level security;
alter table public.nominees enable row level security;
alter table public.vote_packages enable row level security;
alter table public.payments enable row level security;
alter table public.votes enable row level security;
alter table public.receipts enable row level security;
alter table public.nominee_applications enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.financial_ledger enable row level security;
alter table public.audit_logs enable row level security;
alter table public.platform_settings enable row level security;

-- Public read access for active published content
create policy "Public can read approved published events" on public.events for select using (true);
create policy "Public can read categories" on public.categories for select using (true);
create policy "Public can read nominees" on public.nominees for select using (true);
create policy "Public can read vote packages" on public.vote_packages for select using (true);
create policy "Public can read confirmed votes count" on public.votes for select using (true);
create policy "Public can insert votes" on public.votes for insert with check (true);
create policy "Public can create payments" on public.payments for insert with check (true);
create policy "Public can view receipt by public_id" on public.receipts for select using (true);
create policy "Public can submit nominee application" on public.nominee_applications for insert with check (true);
create policy "Public can read platform settings" on public.platform_settings for select using (true);

-- Authenticated Users Policies
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Organizers can manage their own events
create policy "Organizers can insert events" on public.events for insert with check (auth.uid() = organizer_id);
create policy "Organizers can update own events" on public.events for update using (auth.uid() = organizer_id);
create policy "Organizers can view own withdrawals" on public.withdrawal_requests for select using (auth.uid() = organizer_id);
create policy "Organizers can insert withdrawals" on public.withdrawal_requests for insert with check (auth.uid() = organizer_id);

-- Automatic Profile Creation Trigger on Auth Sign-Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    case when lower(new.email) = 'admin@jvican.com' then 'admin' else 'organizer' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
