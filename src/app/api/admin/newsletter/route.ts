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

    let subscribers: any[] = []
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()

      for (const client of [admin, supabase].filter(Boolean)) {
        if (subscribers.length > 0) break

        let query = client!
          .from('newsletter_subscribers')
          .select('*')
          .order('subscribed_at', { ascending: false })

        if (status && status !== 'ALL') {
          query = query.eq('status', status)
        }

        const { data, error } = await query

        if (!error && data && data.length > 0) {
          subscribers = data
        }
      }
    }

    // Fallback or merge with local DB if Supabase returns nothing or is in mock mode
    if (subscribers.length === 0) {
      subscribers = db.getNewsletterSubscribers(status && status !== 'ALL' ? (status as any) : undefined)
    }

    return NextResponse.json({
      success: true,
      subscribers,
    })
  } catch (error: any) {
    console.error('Error fetching admin newsletter subscribers:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, source = 'ADMIN' } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()
      const client = admin || supabase

      if (client) {
        try {
          await client.from('newsletter_subscribers').upsert(
            {
              email: normalizedEmail,
              name: name?.trim() || null,
              source,
              status: 'SUBSCRIBED',
              subscribed_at: new Date().toISOString(),
              unsubscribed_at: null,
            },
            { onConflict: 'email' }
          )
        } catch (supabaseErr) {
          console.warn('Supabase upsert warning in admin newsletter add:', supabaseErr)
        }
      }
    }

    const result = db.subscribeNewsletter({
      email: normalizedEmail,
      name: name?.trim() || undefined,
      source,
    })

    return NextResponse.json({
      success: true,
      subscriber: result.subscriber,
      isNew: result.isNew,
    })
  } catch (error: any) {
    console.error('Error adding subscriber:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to add subscriber' },
      { status: 500 }
    )
  }
}
