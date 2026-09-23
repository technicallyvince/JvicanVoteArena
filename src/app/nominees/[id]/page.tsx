import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"

interface ShortNomineeRedirectProps {
  params: Promise<{ id: string }>
}

export default async function ShortNomineeRedirectPage({ params }: ShortNomineeRedirectProps) {
  const { id } = await params

  let nominee = db.getNomineeByPublicId(id)
  if (!nominee) {
    nominee = db.getNomineeById(id)
  }

  if (!nominee) {
    notFound()
  }

  const event = db.getEventById(nominee.event_id)
  if (!event) {
    notFound()
  }

  redirect(`/events/${event.slug}/nominees/${nominee.public_id}`)
}
