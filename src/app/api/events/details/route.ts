export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'

// Explicit column definitions to prevent overfetching sensitive/large data
const EVENT_PUBLIC_COLUMNS = `
  id,
  organizer_id,
  name,
  slug,
  description,
  logo_url,
  cover_image_url,
  status,
  start_date,
  end_date,
  vote_price,
  currency,
  allow_multiple_votes,
  show_live_results,
  is_featured,
  display_order,
  created_at,
  updated_at
`

const CATEGORY_PUBLIC_COLUMNS = `
  id,
  event_id,
  name,
  slug,
  description,
  display_order,
  created_at,
  updated_at
`

const NOMINEE_PUBLIC_COLUMNS = `
  id,
  event_id,
  category_id,
  name,
  slug,
  description,
  image_url,
  public_id,
  display_order,
  status,
  created_at,
  updated_at
`

const PACKAGE_PUBLIC_COLUMNS = `
  id,
  event_id,
  label,
  quantity,
  display_order,
  created_at
`

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')

    if (!slug && !id) {
      return NextResponse.json({ error: 'Missing slug or id parameter' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()

      for (const client of [admin, supabase].filter(Boolean)) {
        let query = client!
          .from('events')
          .select(`
            ${EVENT_PUBLIC_COLUMNS},
            categories:categories(${CATEGORY_PUBLIC_COLUMNS}),
            nominees:nominees(${NOMINEE_PUBLIC_COLUMNS}),
            vote_packages:vote_packages(${PACKAGE_PUBLIC_COLUMNS})
          `)

        if (id && slug && id === slug) {
          query = query.or(`id.eq.${id},slug.eq.${slug}`)
        } else if (id) {
          query = query.eq('id', id)
        } else if (slug) {
          query = query.eq('slug', slug)
        }

        const { data, error } = await query.maybeSingle()

        if (error) {
          console.error('[Event Details] Supabase query error:', error.message)
          continue
        }

        if (data) {
          // Fetch only the aggregate tally fields from votes table (no voter personal info or payment data)
          const { data: voteRecords } = await client!
            .from('votes')
            .select('nominee_id, quantity')
            .eq('event_id', data.id)
            .eq('status', 'confirmed')

          const voteCountsMap: Record<string, number> = {}
          let totalEventVotes = 0

          if (Array.isArray(voteRecords)) {
            for (const v of voteRecords) {
              const qty = Number(v.quantity) || 0
              voteCountsMap[v.nominee_id] = (voteCountsMap[v.nominee_id] || 0) + qty
              totalEventVotes += qty
            }
          }

          // Fallback check in local memory store if votes exist there
          const localVotes = db.getVotes(data.id).filter((v) => v.status === 'confirmed')
          for (const lv of localVotes) {
            if (!voteRecords?.some((vr: any) => vr.nominee_id === lv.nominee_id && vr.quantity === lv.quantity)) {
              voteCountsMap[lv.nominee_id] = (voteCountsMap[lv.nominee_id] || 0) + lv.quantity
              totalEventVotes += lv.quantity
            }
          }

          const nomineesWithVotes = (data.nominees || []).map((nom: any) => ({
            ...nom,
            vote_count: voteCountsMap[nom.id] || voteCountsMap[nom.public_id] || 0,
          }))

          return NextResponse.json(
            {
              success: true,
              event: {
                ...data,
                total_votes: totalEventVotes,
              },
              categories: data.categories || [],
              nominees: nomineesWithVotes,
              packages: data.vote_packages || [],
            },
            {
              headers: {
                'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
              },
            }
          )
        }
      }
    }

    // Fallback to local store ONLY if Supabase is not configured
    if (!hasSupabase) {
      let localEvent = null
      if (slug) localEvent = db.getEventBySlug(slug)
      else if (id) localEvent = db.getEventById(id)

      if (localEvent) {
        const localNominees = db.getNominees(localEvent.id).map((n) => ({
          ...n,
          vote_count: db.getNomineeVoteCount(n.id),
        }))
        const totalVotes = db
          .getVotes(localEvent.id)
          .filter((v) => v.status === 'confirmed')
          .reduce((sum, v) => sum + v.quantity, 0)

        return NextResponse.json(
          {
            success: true,
            event: {
              ...localEvent,
              total_votes: totalVotes,
            },
            categories: db.getCategories(localEvent.id),
            nominees: localNominees,
            packages: db.getVotePackages(localEvent.id),
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
            },
          }
        )
      }
    }

    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  } catch (error: any) {
    console.error('Error fetching event details:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
