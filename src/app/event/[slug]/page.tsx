import { redirect } from "next/navigation"

interface EventRedirectProps {
  params: Promise<{ slug: string }>
}

export default async function EventLegacyRedirect({ params }: EventRedirectProps) {
  const { slug } = await params
  redirect(`/events/${slug}`)
}
