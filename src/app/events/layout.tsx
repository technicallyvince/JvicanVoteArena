import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Live Competitions & Voting Events',
  description:
    'Discover live pageants, academic awards, cultural recognitions, and talent competitions. Support your favorite candidates with verified online votes.',
  openGraph: {
    title: 'Explore Live Competitions & Voting Events | JVican Vote Arena',
    description:
      'Discover live pageants, academic awards, cultural recognitions, and talent competitions with instant cryptographic receipts.',
  },
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
