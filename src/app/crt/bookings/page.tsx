"use client"

import Link from "next/link"
import { describeWhen, statusLabel } from "@/lib/format"
import { useNeCrt } from "@/lib/store"

export default function BookingsPage() {
  const store = useNeCrt()
  if (!store.ready) return null

  const rows = store.state.applications
    .filter((application) => application.crtId === store.crt.id && application.status !== "withdrawn")
    .map((application) => ({
      application,
      opening: store.state.openings.find((opening) => opening.id === application.openingId),
    }))
    .filter((row) => row.opening)
    .sort((a, b) => (a.opening?.slots[0]?.date ?? "").localeCompare(b.opening?.slots[0]?.date ?? ""))

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-clay-deep uppercase">Yours</p>
      <h1 className="mt-1 font-display text-4xl sm:text-5xl">My bookings</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Confirmed days are yours. Anything still waiting needs the school to say yes.
      </p>
      {rows.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          Nothing here yet.{" "}
          <Link href="/crt/days" className="underline">
            Look at available days.
          </Link>
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map(({ application, opening }) => {
            if (!opening) return null
            const school = store.state.schools.find((item) => item.id === opening.schoolId)
            const confirmed = application.status === "confirmed"
            return (
              <li
                key={application.id}
                className={confirmed ? "rounded-3xl bg-moss p-5 text-cream" : "rounded-3xl border border-border bg-card p-5"}
              >
                <p className={confirmed ? "text-sm text-cream/80" : "text-sm text-muted-foreground"}>
                  {statusLabel(application.status)}
                </p>
                <h2 className="font-display text-3xl">{school?.short}</h2>
                <p className="mt-1">
                  {opening.role} · {opening.gradeLabel}
                </p>
                <p className="mt-1 text-sm">{describeWhen(opening)}</p>
                {application.note ? <p className="mt-2 text-sm">Your note: {application.note}</p> : null}
                {school ? <p className="mt-2 text-sm opacity-80">{school.address}</p> : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
