import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    const supabase = await createClient()

    // Identity comes from the NextAuth session, not Supabase Auth
    const session = await auth()
    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionUserId = session.user.id
    const organizerEmail = session.user.email
    const organizerName = session.user.name || 'Organizer'

    const body = await req.json()
    const {
      name,
      description,
      slug,
      startDate,
      endDate,
      bannerImageUrl,
      logoUrl,
      votePrice,
      currency = 'NGN',
      showLiveResults = true,
      payoutBank,
      payoutAccountNumber,
      payoutAccountName,
      categories = [],
      nominees = [],
    } = body

    if (!name || !description || !slug) {
      return NextResponse.json(
        { error: 'Event name, description, and slug are required.' },
        { status: 400 }
      )
    }

    const price = Number(votePrice) || 100

    let supabaseEventId: string | null = null
    let supabaseError: any = null

    // Pick client: admin client (bypasses RLS) if available, otherwise scoped supabase client
    const client = admin || supabase

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {

      // Insert Event into Supabase.
      // `organizer_id` is left null on purpose: it is a uuid FK into
      // public.profiles, whose rows are owned by Supabase Auth. Since auth is
      // handled by NextAuth, no matching profile exists and the FK would fail.
      // The denormalized organizer_name/organizer_email columns carry identity.
      const { data: eventData, error: eventErr } = await client
        .from('events')
        .insert({
          organizer_id: null,
          organizer_name: organizerName,
          organizer_email: organizerEmail,
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          logo_url: logoUrl || null,
          cover_image_url: bannerImageUrl || null,
          status: 'pending_approval',
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          vote_price: price,
          currency: currency,
          allow_multiple_votes: true,
          show_live_results: showLiveResults,
          is_featured: false,
          payout_bank: payoutBank || null,
          payout_account_number: payoutAccountNumber || null,
          payout_account_name: payoutAccountName || null,
        })
        .select()
        .single()

      if (eventErr) {
        console.error('[Supabase Create Event Error]:', eventErr)
        supabaseError = eventErr.message
      } else if (eventData) {
        supabaseEventId = eventData.id

        // Insert Categories into Supabase
        const categoryMap: { [draftId: string]: string } = {}
        for (let i = 0; i < categories.length; i++) {
          const cat = categories[i]
          const { data: catData, error: catErr } = await client
            .from('categories')
            .insert({
              event_id: supabaseEventId,
              name: cat.name.trim(),
              slug: `${slug}-${i + 1}-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              description: cat.description || null,
              display_order: i + 1,
            })
            .select()
            .single()

          if (!catErr && catData) {
            categoryMap[cat.id] = catData.id
          }
        }

        // Insert Nominees into Supabase
        if (nominees.length > 0) {
          const nomineeInserts = nominees.map((nom: any, idx: number) => {
            const actualCategoryId = categoryMap[nom.categoryId] || Object.values(categoryMap)[0]
            return {
              event_id: supabaseEventId,
              category_id: actualCategoryId,
              name: nom.name.trim(),
              slug: `${slug}-nom-${idx + 1}-${nom.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              description: nom.bio || null,
              image_url: nom.imageUrl || null,
              public_id: `NOM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              display_order: idx + 1,
              status: 'active',
            }
          })

          await client.from('nominees').insert(nomineeInserts)
        }
      }
    }

    // Always mirror to in-memory store for instant UI sync & local testing
    const localEvent = db.createEvent({
      id: supabaseEventId || slug,
      organizer_id: sessionUserId,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      logo_url: logoUrl,
      cover_image_url: bannerImageUrl,
      status: 'pending_approval',
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      vote_price: price,
      currency: currency,
      allow_multiple_votes: true,
      show_live_results: showLiveResults,
      is_featured: false,
      display_order: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const localCatMap: { [draftId: string]: string } = {}
    categories.forEach((cat: any, i: number) => {
      const c = db.createCategory({
        id: `${localEvent.id}-cat-${i + 1}`,
        event_id: localEvent.id,
        name: cat.name.trim(),
        slug: `${slug}-${i + 1}`,
        description: cat.description || 'Category',
        display_order: i + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      localCatMap[cat.id] = c.id
    })

    nominees.forEach((nom: any, i: number) => {
      db.createNominee({
        id: `${localEvent.id}-nom-${i + 1}`,
        event_id: localEvent.id,
        category_id: localCatMap[nom.categoryId] || Object.values(localCatMap)[0],
        name: nom.name.trim(),
        slug: `${slug}-nom-${i + 1}`,
        description: nom.bio || 'Nominee',
        image_url: nom.imageUrl,
        public_id: `NOM-${i + 1}`,
        display_order: i + 1,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    })

    return NextResponse.json({
      success: true,
      event: {
        id: supabaseEventId || localEvent.id,
        slug: slug.trim(),
        name: name.trim(),
      },
      supabaseSynced: Boolean(supabaseEventId),
      supabaseError: supabaseError,
    })
  } catch (error: any) {
    console.error('Failed to create event:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create event.' },
      { status: 500 }
    )
  }
}
