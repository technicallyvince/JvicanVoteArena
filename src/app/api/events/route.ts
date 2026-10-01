export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const featured = searchParams.get('featured')
    const requestedStatus = searchParams.get('status')

    let events: any[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()

      for (const client of [admin, supabase].filter(Boolean)) {
        if (events.length > 0) break

        // Lightweight public event projection - strictly excluding banking/payout/financial fields
        let query = client!
          .from('events')
          .select(`
            id,
            name,
            slug,
            description,
            cover_image_url,
            logo_url,
            start_date,
            end_date,
            status,
            vote_price,
            currency,
            is_featured,
            display_order,
            created_at,
            categories:categories(id, event_id, name, slug),
            nominees:nominees(id, event_id, category_id, name, public_id)
          `)
          .in('status', requestedStatus ? [requestedStatus] : ['published', 'approved'])
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })

        if (featured === 'true') {
          query = query.eq('is_featured', true)
        }

        const { data, error } = await query

        if (error) {
          console.error('[Public Events GET] Supabase query error:', error.message)
          continue
        }

        if (data && data.length > 0) {
          events = data.map((ev: any) => ({
            id: ev.id,
            name: ev.name,
            slug: ev.slug,
            description: ev.description,
            cover_image_url: ev.cover_image_url,
            logo_url: ev.logo_url,
            start_date: ev.start_date,
            end_date: ev.end_date,
            status: ev.status,
            vote_price: ev.vote_price,
            currency: ev.currency,
            is_featured: ev.is_featured,
            display_order: ev.display_order,
            created_at: ev.created_at,
            categories_count: Array.isArray(ev.categories) ? ev.categories.length : 0,
            nominees_count: Array.isArray(ev.nominees) ? ev.nominees.length : 0,
            // Provide lightweight categories & nominees for client-side search filtering without images or bios
            categories: (ev.categories || []).map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
            })),
            nominees: (ev.nominees || []).map((n: any) => ({
              id: n.id,
              name: n.name,
              public_id: n.public_id,
              category_id: n.category_id,
            })),
          }))
        }
      }
    }

    // Fallback to local store if Supabase is not configured
    if (!hasSupabase && events.length === 0) {
      let localEvents = db
        .getEvents()
        .filter((e) => e.status === 'published' || e.status === 'approved')

      if (featured === 'true') {
        localEvents = localEvents.filter((e) => e.is_featured)
      }

      events = localEvents.map((e) => {
        const cats = db.getCategories(e.id)
        const noms = db.getNominees(e.id)
        return {
          id: e.id,
          name: e.name,
          slug: e.slug,
          description: e.description,
          cover_image_url: e.cover_image_url,
          logo_url: e.logo_url,
          start_date: e.start_date,
          end_date: e.end_date,
          status: e.status,
          vote_price: e.vote_price,
          currency: e.currency,
          is_featured: e.is_featured,
          display_order: e.display_order,
          created_at: e.created_at,
          categories_count: cats.length,
          nominees_count: noms.length,
          categories: cats.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          })),
          nominees: noms.map((n) => ({
            id: n.id,
            name: n.name,
            public_id: n.public_id,
            category_id: n.category_id,
          })),
        }
      })
    }

    return NextResponse.json(
      { success: true, events },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        },
      }
    )
  } catch (error: any) {
    console.error('[Public Events GET] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch public events' },
      { status: 500 }
    )
  }
}
