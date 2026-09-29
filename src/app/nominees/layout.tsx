import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Nominees & Contenders Directory',
  description:
    'Search and explore all registered contenders and candidates across active competitions. Cast verified instant votes with official receipts.',
  openGraph: {
    title: 'Browse Nominees & Contenders Directory | JVican Vote Arena',
    description:
      'Search and explore contenders across all live competitions on JVican Vote Arena.',
  },
}

export default function NomineesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
