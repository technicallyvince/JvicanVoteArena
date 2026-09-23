import { redirect } from "next/navigation"

export default function LegacyCreateEventRedirect() {
  redirect("/dashboard/events/new")
}
