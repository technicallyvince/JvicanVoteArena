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
          return NextResponse.json({
            success: true,
            event: data,
            categories: data.categories || [],
            nominees: data.nominees || [],
            packages: data.vote_packages || [],
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
        return NextResponse.json({
          success: true,
          event: localEvent,
          categories: db.getCategories(localEvent.id),
          nominees: db.getNominees(localEvent.id),
          packages: db.getVotePackages(localEvent.id),
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
