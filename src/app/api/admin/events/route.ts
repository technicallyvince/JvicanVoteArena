import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const admin = getSupabaseAdmin()
    const supabase = await createClient()
    const client = admin || supabase

    let events: any[] = []

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
      let query = client
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

      if (!error && data) {
        events = data
      }
    }

    // Fallback/merge with local mock store if Supabase returns nothing or in local test mode
    if (events.length === 0) {
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

    const admin = getSupabaseAdmin()
    const supabase = await createClient()
    const client = admin || supabase

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
      const { data, error } = await client
        .from('events')
        .update({
          status,
          rejection_reason: rejectionReason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .select()

      if (error) {
        console.error('[Supabase Admin Event Approval Error]:', error)
        return NextResponse.json(
          { error: `Database update failed: ${error.message}` },
          { status: 403 }
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
