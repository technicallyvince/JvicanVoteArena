import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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

    // 1. Check if Supabase keys and database connection are configured
    const isSupabaseConfigured =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

    let supabaseEventId: string | null = null
    let supabaseError: any = null

    if (isSupabaseConfigured) {
      // Use supabaseAdmin or user-scoped client to insert event
      const client = supabaseAdmin || supabase

      // Ensure profile exists if user is authenticated
      let organizerId: string | null = user?.id || null
      let organizerEmail: string = user?.email || 'organizer@jvican.com'
      let organizerName: string = user?.user_metadata?.full_name || 'Organizer'

      if (organizerId && organizerEmail) {
        // Upsert profile record
        await client.from('profiles').upsert(
          {
            id: organizerId,
            email: organizerEmail,
            full_name: organizerName,
            role: 'organizer',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
      }

      // Insert Event into Supabase
      const { data: eventData, error: eventErr } = await client
        .from('events')
        .insert({
          organizer_id: organizerId,
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
      organizer_id: user?.id || '11111111-1111-1111-1111-111111111111',
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
