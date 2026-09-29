import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface EventLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jvicanvotearena.vercel.app'

  let event: any = null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

  if (hasSupabase) {
    try {
      const admin = getSupabaseAdmin()
      if (admin) {
        const { data } = await admin
          .from('events')
          .select('*')
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .maybeSingle()
        if (data) {
          event = data
        }
      }
    } catch (err) {
      console.warn('[SEO generateMetadata] Supabase query fallback:', err)
    }
  }

  if (!event) {
    event = db.getEventBySlug(slug) || db.getEventById(slug)
  }

  if (!event) {
    return {
      title: 'Event Details',
      description: 'Explore live event voting, categories, and contestants on JVican Vote Arena.',
    }
  }

  const title = `${event.name} — Vote Online & Live Standings`
  const description =
    event.description ||
    `Cast your verified votes for candidates in ${event.name}. Live leaderboard and instant certified receipts.`
  const ogImage = event.cover_image_url || event.logo_url || '/brand/jvican-vote-arena-logo.png'

  return {
    title,
    description,
    alternates: {
      canonical: `/events/${event.slug || slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/events/${event.slug || slug}`,
      siteName: 'JVican Vote Arena',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function EventDetailLayout({ children, params }: EventLayoutProps) {
  const { slug } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jvicanvotearena.vercel.app'

  let event: any = null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

  if (hasSupabase) {
    try {
      const admin = getSupabaseAdmin()
      if (admin) {
        const { data } = await admin
          .from('events')
          .select('*')
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .maybeSingle()
        if (data) {
          event = data
        }
      }
    } catch {}
  }

  if (!event) {
    event = db.getEventBySlug(slug) || db.getEventById(slug)
  }

  const eventJsonLd = event
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        location: {
          '@type': 'VirtualLocation',
          url: `${baseUrl}/events/${event.slug || slug}`,
        },
        image: [event.cover_image_url || event.logo_url || `${baseUrl}/brand/jvican-vote-arena-logo.png`],
        organizer: {
          '@type': 'Organization',
          name: event.organizer_name || 'JVican Vote Arena Organizer',
          url: baseUrl,
        },
        offers: {
          '@type': 'Offer',
          price: event.vote_price || '100',
          priceCurrency: event.currency || 'NGN',
          url: `${baseUrl}/events/${event.slug || slug}`,
          availability: 'https://schema.org/InStock',
          validFrom: event.start_date,
        },
      }
    : null

  return (
    <>
      {eventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      )}
      {children}
    </>
  )
}
