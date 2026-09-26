import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

interface ShortNomineeRedirectProps {
  params: Promise<{ id: string }>
}

export default async function ShortNomineeRedirectPage({ params }: ShortNomineeRedirectProps) {
  const { id } = await params

  let nominee: any = null
  let event: any = null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

  if (hasSupabase) {
    const admin = getSupabaseAdmin()
    const supabase = await createClient()
    for (const client of [admin, supabase].filter(Boolean)) {
      const { data: nomData } = await client!
        .from('nominees')
        .select('*, events:event_id(*)')
        .or(`id.eq.${id},public_id.eq.${id}`)
        .maybeSingle()
      if (nomData) {
        nominee = nomData
        event = nomData.events
        break
      }
    }
  }

  if (!nominee) {
    nominee = db.getNomineeByPublicId(id) || db.getNomineeById(id)
    if (nominee) {
      event = db.getEventById(nominee.event_id)
    }
  }

  if (!nominee || !event) {
    notFound()
  }

  redirect(`/events/${event.slug}/nominees/${nominee.public_id || nominee.id}`)
}
