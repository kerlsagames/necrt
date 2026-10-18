import { Suspense } from "react"
import { RequestDesk } from "@/components/request-desk"

export default function RequestPage() {
  return (
    <Suspense fallback={<p className="font-display text-3xl">Loading the calendar…</p>}>
      <RequestDesk />
    </Suspense>
  )
}
