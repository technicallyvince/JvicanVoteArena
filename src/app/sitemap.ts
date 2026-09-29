import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jvicanvotearena.vercel.app'
  const currentDate = new Date().toISOString()

  // 1. Static Public Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nominees`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/winners`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // 2. Fetch Active Events & Nominees from Database
  let dynamicEventRoutes: MetadataRoute.Sitemap = []
  let dynamicNomineeRoutes: MetadataRoute.Sitemap = []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

  let events: any[] = []
  let nominees: any[] = []

  if (hasSupabase) {
    try {
      const client = getSupabaseAdmin()
      if (client) {
        const [evRes, nomRes] = await Promise.all([
          client
            .from('events')
            .select('id, slug, updated_at, status')
            .in('status', ['published', 'approved', 'closed']),
          client
            .from('nominees')
            .select('id, public_id, slug, event_id, updated_at, status')
            .eq('status', 'active'),
        ])

        if (evRes.data) events = evRes.data
        if (nomRes.data) nominees = nomRes.data
      }
    } catch (err) {
      console.warn('[Sitemap] Database fetch error, falling back to local store:', err)
    }
  }

  // Local fallback
  if (events.length === 0) {
    events = db.getEvents().filter((e) => ['published', 'approved', 'closed'].includes(e.status))
  }
  if (nominees.length === 0) {
    nominees = db.getNominees().filter((n) => n.status === 'active')
  }

  // Map events to sitemap
  const eventSlugMap = new Map(events.map((e) => [e.id, e.slug]))

  dynamicEventRoutes = events.map((ev) => ({
    url: `${baseUrl}/events/${ev.slug}`,
    lastModified: ev.updated_at || currentDate,
    changeFrequency: 'hourly',
    priority: 0.9,
  }))

  // Map nominees to canonical URLs
  dynamicNomineeRoutes = nominees.map((nom) => {
    const eventSlug = eventSlugMap.get(nom.event_id)
    const url = eventSlug
      ? `${baseUrl}/events/${eventSlug}/nominees/${nom.public_id || nom.id}`
      : `${baseUrl}/nominees/${nom.public_id || nom.id}`

    return {
      url,
      lastModified: nom.updated_at || currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    }
  })

  return [...staticRoutes, ...dynamicEventRoutes, ...dynamicNomineeRoutes]
}
