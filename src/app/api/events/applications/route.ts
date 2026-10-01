export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { nanoid } from 'nanoid'

// POST /api/events/applications - Submit a contestant application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      eventId,
      categoryId,
      fullName,
      email,
      phone,
      bio,
      imageUrl,
      instagramHandle,
      reasonToWin,
    } = body

    if (!eventId || !categoryId || !fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Event, category, full name, email, and phone number are required.' },
        { status: 400 }
      )
    }

    const newApp = {
      id: nanoid(),
      event_id: eventId,
      category_id: categoryId,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      bio: bio?.trim() || null,
      image_url: imageUrl?.trim() || null,
      instagram_handle: instagramHandle?.trim() || null,
      reason_to_win: reasonToWin?.trim() || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()
      const client = admin || supabase

      if (client) {
        const { data, error } = await client
          .from('nominee_applications')
          .insert(newApp)
          .select()
          .single()

        if (error) {
          console.error('[Application Submission Supabase Error]:', error.message)
        } else if (data) {
          // Sync local
          db.createNomineeApplication(data as any)
          return NextResponse.json({ success: true, application: data })
        }
      }
    }

    // Fallback sync
    db.createNomineeApplication(newApp as any)
    return NextResponse.json({ success: true, application: newApp })
  } catch (err: any) {
    console.error('Error submitting nominee application:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to submit application.' },
      { status: 500 }
    )
  }
}

// GET /api/events/applications?eventId=... - Fetch applications for an event (organizer / admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    let applications: any[] = []

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()
      const client = admin || supabase

      if (client) {
        const { data, error } = await client
          .from('nominee_applications')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })

        if (!error && data) {
          applications = data
        }
      }
    }

    if (applications.length === 0) {
      applications = db.getNomineeApplications(eventId)
    }

    return NextResponse.json({ success: true, applications })
  } catch (err: any) {
    console.error('Error fetching applications:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch applications.' },
      { status: 500 }
    )
  }
}

// PATCH /api/events/applications - Approve or Reject an application
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { applicationId, status, adminNotes } = body

    if (!applicationId || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Valid application ID and status are required.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()
      const client = admin || supabase

      if (client) {
        // 1. Fetch current application
        const { data: app, error: getErr } = await client
          .from('nominee_applications')
          .select('*')
          .eq('id', applicationId)
          .single()

        if (getErr || !app) {
          console.error('[Application Approval] Not found in Supabase:', getErr)
        } else {
          // 2. Update application status
          const { error: updateErr } = await client
            .from('nominee_applications')
            .update({
              status,
              admin_notes: adminNotes || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', applicationId)

          if (updateErr) {
            console.error('[Application Approval Update Error]:', updateErr)
          }

          // 3. If approved, create the nominee in the database
          if (status === 'approved') {
            // Check if nominee already exists
            const { data: existingNom } = await client
              .from('nominees')
              .select('id')
              .eq('event_id', app.event_id)
              .ilike('name', app.full_name)
              .maybeSingle()

            if (!existingNom) {
              // Generate numeric public_id for contestant
              const { data: eventNominees } = await client
                .from('nominees')
                .select('public_id')
                .eq('event_id', app.event_id)

              const existingPublicIds = new Set((eventNominees || []).map((n: any) => n.public_id))
              let nextNumber = (eventNominees || []).length + 1
              let publicId = nextNumber < 10 ? `00${nextNumber}` : nextNumber < 100 ? `0${nextNumber}` : `${nextNumber}`
              while (existingPublicIds.has(publicId)) {
                nextNumber++
                publicId = nextNumber < 10 ? `00${nextNumber}` : nextNumber < 100 ? `0${nextNumber}` : `${nextNumber}`
              }

              const newNominee = {
                id: nanoid(),
                event_id: app.event_id,
                category_id: app.category_id,
                name: app.full_name,
                slug: app.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                description: app.bio || app.reason_to_win || 'Contestant approved by event organizers.',
                image_url: app.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
                public_id: publicId,
                display_order: (eventNominees || []).length + 1,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }

              await client.from('nominees').insert(newNominee)
            }
          }
        }
      }
    }

    // Always synchronize local memory store
    db.updateNomineeApplicationStatus(applicationId, status, adminNotes)

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully.`,
    })
  } catch (err: any) {
    console.error('Error updating application status:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to update application status.' },
      { status: 500 }
    )
  }
}
