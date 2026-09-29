export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()

      for (const client of [admin, supabase].filter(Boolean)) {
        let query = client!
          .from('events')
          .select(`
            *,
            categories:categories(*),
            nominees:nominees(*),
            vote_packages:vote_packages(*)
          `)

        if (id && slug && id === slug) {
          // Identifier could be either a UUID id or a slug
          query = query.or(`id.eq.${id},slug.eq.${slug}`)
        } else if (id) {
          query = query.eq('id', id)
        } else if (slug) {
          query = query.eq('slug', slug)
        }

        const { data, error } = await query.maybeSingle()

        if (error) {
          console.error('[Event Details] Supabase query error:', error.message)
          continue // try next client
        }

        if (data) {
          // Fetch confirmed votes for this event to calculate live leaderboard and nominee vote counts
          const { data: voteRecords } = await client!
            .from('votes')
            .select('nominee_id, quantity, category_id, status')
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

          return NextResponse.json({
            success: true,
            event: {
              ...data,
              total_votes: totalEventVotes,
            },
            categories: data.categories || [],
            nominees: nomineesWithVotes,
            packages: data.vote_packages || [],
            votes: voteRecords || [],
          })
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

        return NextResponse.json({
          success: true,
          event: {
            ...localEvent,
            total_votes: totalVotes,
          },
          categories: db.getCategories(localEvent.id),
          nominees: localNominees,
          packages: db.getVotePackages(localEvent.id),
          votes: db.getVotes(localEvent.id).filter((v) => v.status === 'confirmed'),
        })
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
