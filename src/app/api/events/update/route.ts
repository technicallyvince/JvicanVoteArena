export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId, name, description, vote_price, start_date, end_date, cover_image_url } = body

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updates.name = name.trim()
    if (description !== undefined) updates.description = description.trim()
    if (vote_price !== undefined) {
      const price = parseFloat(vote_price)
      if (isNaN(price) || price < 100) {
        return NextResponse.json({ error: 'Minimum price per vote is ₦100' }, { status: 400 })
      }
      updates.vote_price = price
    }
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()

      for (const client of [admin, supabase].filter(Boolean)) {
        const { error } = await client!
          .from('events')
          .update(updates)
          .eq('id', eventId)

        if (!error) {
          break
        }
      }
    }

    // Synchronize to local memory/localStorage store
    db.updateEvent(eventId, updates)

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      event: updates,
    })
  } catch (err: any) {
    console.error('Error updating event:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to update event details' },
      { status: 500 }
    )
  }
}
