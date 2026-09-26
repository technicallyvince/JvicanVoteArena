export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let events: any[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      // Try admin client first, then fall back to anon client
      const admin = getSupabaseAdmin()
      const supabase = await createClient()

      for (const client of [admin, supabase].filter(Boolean)) {
        if (events.length > 0) break

        let query = client!
          .from('events')
          .select(`
            *,
            categories:categories(*),
            nominees:nominees(*)
          `)
          .order('created_at', { ascending: false })

        if (status) {
          query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
          console.error('[Admin Events GET] Supabase query error:', error.message)
          continue // try next client
        }

        if (data && data.length > 0) {
          events = data
        }
      }
    }

    // Fallback to local mock store ONLY if Supabase is not configured at all
    if (!hasSupabase && events.length === 0) {
      let localEvents = db.getEvents()
      if (status) {
        localEvents = localEvents.filter((e) => e.status === status)
      }
      events = localEvents.map((e) => ({
        ...e,
        categories: db.getCategories(e.id),
        nominees: db.getNominees(e.id),
      }))
    }

    return NextResponse.json({ success: true, events })
  } catch (error: any) {
    console.error('Error fetching admin events:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId, status, rejectionReason } = body

    if (!eventId || !status) {
      return NextResponse.json(
        { error: 'Event ID and target status are required.' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    let dbUpdated = false

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()

      for (const client of [admin, supabase].filter(Boolean)) {
        if (dbUpdated) break

        const { data, error } = await client!
          .from('events')
          .update({
            status,
            rejection_reason: rejectionReason || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', eventId)
          .select()

        if (error) {
          console.error('[Admin Events PATCH] Supabase update error:', error.message)
          continue
        }

        if (data && data.length > 0) {
          dbUpdated = true
        }
      }

      if (!dbUpdated) {
        return NextResponse.json(
          { error: 'Failed to update event in database. Check service role key configuration.' },
          { status: 500 }
        )
      }
    }

    // Also update local store
    db.updateEventApprovalStatus(eventId, status, rejectionReason)

    return NextResponse.json({ success: true, eventId, status })
  } catch (error: any) {
    console.error('Error updating event status:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update event status' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()

      for (const client of [admin, supabase].filter(Boolean)) {
        const { error } = await client!
          .from('events')
          .delete()
          .eq('id', eventId)

        if (error) {
          console.error('[Admin Events DELETE] Supabase delete error:', error.message)
        }
      }
    }

    // Also remove from local mock if present
    db.deleteEvent(eventId)

    return NextResponse.json({ success: true, eventId })
  } catch (error: any) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete event' },
      { status: 500 }
    )
  }
}
