import { Suspense } from "react"
import { CrtResume } from "@/components/crt-resume"

export default function CrtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="font-display text-3xl">Opening the resume…</p>}>
      <CrtResume params={params} />
    </Suspense>
  )
}
