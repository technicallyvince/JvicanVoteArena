-- Make confirmed votes actually visible, and make the write path trustworthy.
--
-- Symptom this fixes: voters completed checkout and the gateway reported the
-- money as received, but the vote stayed 'pending' forever. Standings only ever
-- count 'confirmed' votes, so paid votes never appeared in any tally, on any
-- page, for anyone.
--
-- What contributed, and what is addressed here:
--
--   - Confirmation depends entirely on the browser tab reaching the callback
--     route. When it does not, nothing else can promote the vote. That is fixed
--     in code (callback polling plus npm run reconcile:votes), not here.
--
--   - public.votes has no UPDATE policy, and the fulfillment path falls back to
--     an anon/authenticated client when the service role key is absent. RLS does
--     not raise on UPDATE, it filters to zero rows, so an un-checked .update()
--     confirms nothing and reports no error. The policy below makes that
--     guarantee explicit so no future code path can confirm a vote as a client.
--
--   - public.votes was not in the supabase_realtime publication, so both
--     postgres_changes subscriptions (event page and nominee page) never fired
--     and "live" standings only moved on a full page load. Fixed in section 2.
--
-- Note on a separate, deliberately NOT changed issue: the policy named
-- "Public can read confirmed votes count" on public.votes is USING (true), so
-- anonymous callers can select voter_email and payment_reference. Narrowing it
-- needs a column-level GRANT, which Supabase Realtime's authorization check does
-- not honour, so doing it here would silently break the live updates fixed in
-- section 2. It needs its own migration.

-- ---------------------------------------------------------------------------
-- 1. Client-side vote confirmation is never permitted
-- ---------------------------------------------------------------------------

-- Service role bypasses RLS, so fulfillment and reconciliation are unaffected.
-- This exists so that "let the client confirm its own vote" is a change anyone
-- touching votes has to look at and undo deliberately.
DROP POLICY IF EXISTS "Only service role may confirm votes" ON public.votes;
CREATE POLICY "Only service role may confirm votes"
  ON public.votes
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- A vote is always created unsettled. Promotion to 'confirmed' happens
-- server-side only, after the gateway reports the money arrived.
DROP POLICY IF EXISTS "Public can insert votes" ON public.votes;
CREATE POLICY "Public can insert votes"
  ON public.votes
  FOR INSERT
  WITH CHECK (status = 'pending');

-- ---------------------------------------------------------------------------
-- 2. Publish votes to realtime so live standings actually update
-- ---------------------------------------------------------------------------

-- ADD TABLE raises when the relation is already a member, so guard it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 3. Idempotency and lookup support
-- ---------------------------------------------------------------------------

-- One ledger row per settled payment. The reconciliation job and the gateway
-- webhook can both fire for the same reference; this makes the loser a no-op
-- instead of a duplicate payout row.
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_ledger_payment_ref
  ON public.financial_ledger(payment_reference);

-- Every public tally is "confirmed votes for this event", which was served by
-- idx_votes_event plus a status filter on a table that only ever grows.
CREATE INDEX IF NOT EXISTS idx_votes_event_status
  ON public.votes(event_id, status);

-- ---------------------------------------------------------------------------
-- 4. Payment integrity
-- ---------------------------------------------------------------------------

-- quantity must be positive for every status, not merely >= 10. Existing rows
-- satisfy this, so the constraint is defensive rather than a known-bad cleanup.
ALTER TABLE public.votes
  DROP CONSTRAINT IF EXISTS votes_quantity_positive;
ALTER TABLE public.votes
  ADD CONSTRAINT votes_quantity_positive CHECK (quantity > 0);

-- ---------------------------------------------------------------------------
-- 5. Repair organizer ownership so payouts can be attributed
-- ---------------------------------------------------------------------------
--
-- The event create route inserts events.organizer_id as NULL (the FK targets
-- profiles, and the create path preferred the denormalized
-- organizer_name/organizer_email pair). But public.financial_ledger.organizer_id
-- is NOT NULL REFERENCES public.profiles(id), so every ledger write for such an
-- event either failed on the foreign key or had to fabricate a nil UUID - which
-- no profiles row satisfies, so it failed anyway. Net effect: organizer revenue
-- was permanently zero even for fully paid events.
--
-- profiles rows do exist for every signed-in user, and events.organizer_email is
-- populated, so the real owner is recoverable. Link them by email (case-insensitive
-- to match the sign-in path), then let the ledger carry the email forward so
-- payouts stay attributable even if a profile row is later removed.

UPDATE public.events e
SET organizer_id = p.id
FROM public.profiles p
WHERE e.organizer_id IS NULL
  AND e.organizer_email IS NOT NULL
  AND lower(p.email) = lower(e.organizer_email);

ALTER TABLE public.financial_ledger
  ADD COLUMN IF NOT EXISTS organizer_email TEXT;

UPDATE public.financial_ledger l
SET organizer_email = e.organizer_email
FROM public.events e
WHERE e.id = l.event_id
  AND l.organizer_email IS NULL
  AND e.organizer_email IS NOT NULL;

-- Index for the wallet's per-organizer ledger lookups.
CREATE INDEX IF NOT EXISTS idx_financial_ledger_organizer
  ON public.financial_ledger(organizer_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_organizer_email
  ON public.financial_ledger(lower(organizer_email));

-- Backfill payout ledger rows for confirmed votes that were settled before the
-- service-role/webhook fixes started writing financial_ledger reliably.
INSERT INTO public.financial_ledger (
  transaction_id,
  event_id,
  event_name,
  organizer_id,
  organizer_email,
  organizer_name,
  voter_email,
  gross_amount,
  platform_fee,
  organizer_amount,
  currency,
  payment_reference,
  status,
  created_at
)
SELECT
  COALESCE(v.payment_id::text, 'pay-' || v.payment_reference) AS transaction_id,
  v.event_id,
  COALESCE(e.name, 'Voting Event') AS event_name,
  e.organizer_id,
  e.organizer_email,
  COALESCE(e.organizer_name, 'Event Organizer') AS organizer_name,
  v.voter_email,
  v.total_amount AS gross_amount,
  round(v.total_amount * 0.10)::integer AS platform_fee,
  v.total_amount - round(v.total_amount * 0.10)::integer AS organizer_amount,
  COALESCE(v.currency, e.currency, 'NGN') AS currency,
  v.payment_reference,
  'verified' AS status,
  COALESCE(v.created_at, now()) AS created_at
FROM public.votes v
JOIN public.events e ON e.id = v.event_id
WHERE v.status = 'confirmed'
  AND v.payment_reference IS NOT NULL
  AND e.organizer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.financial_ledger l
    WHERE l.payment_reference = v.payment_reference
  );
