"use client"

import Link from "next/link"
import { Portrait } from "@/components/portrait"
import { crtCanSee } from "@/lib/access"
import { describeWhen } from "@/lib/format"
import { useNeCrt } from "@/lib/store"

export default function CrtDeskPage() {
  const store = useNeCrt()
  if (!store.ready) return null

  const open = store.state.openings.filter(
    (opening) => opening.status === "open" && crtCanSee(store.state, store.crt.id, opening),
  )
  const confirmed = store.state.applications
    .filter((application) => application.crtId === store.crt.id && application.status === "confirmed")
    .map((application) => ({
      application,
      opening: store.state.openings.find((opening) => opening.id === application.openingId),
    }))
    .filter((item) => item.opening)
  const schools = store.state.schools.filter((school) => store.crt.schoolIds.includes(school.id))

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <Portrait look={store.crt.look} photo={store.crt.photo} className="size-20" />
        <div>
          <p className="text-sm font-medium tracking-wide text-clay-deep uppercase">{store.crt.town}</p>
          <h1 className="font-display text-4xl text-balance sm:text-6xl">{store.crt.firstName}&rsquo;s desk</h1>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        {open.length > 0
          ? `${open.length} open ${open.length === 1 ? "day" : "days"} at the schools you’ve chosen.`
          : "No open days at your schools right now. Check back, or add another school on your profile."}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/crt/days" className="desk-card min-h-44 bg-clay-deep p-6 text-cream">
          <p className="text-sm tracking-wide text-cream/80 uppercase">Work</p>
          <p className="mt-3 font-display text-4xl">Available days</p>
          <p className="mt-2 text-sm text-cream/85">See what’s out and take a day. The school still confirms.</p>
        </Link>
        <Link href="/crt/bookings" className="desk-card border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Yours</p>
          <p className="mt-3 font-display text-4xl">My bookings</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {confirmed.length > 0 ? `${confirmed.length} confirmed.` : "Waiting and confirmed days live here."}
          </p>
        </Link>
        <Link href="/crt/profile" className="desk-card border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">You</p>
          <p className="mt-3 font-display text-4xl">Profile</p>
          <p className="mt-2 text-sm text-muted-foreground">VIT, photo, resume, and the schools you work with.</p>
        </Link>
      </div>

      <section className="mt-10" aria-labelledby="next-heading">
        <h2 id="next-heading" className="font-display text-3xl">
          Coming up for you
        </h2>
        {confirmed.length === 0 ? (
          <p className="mt-3 text-muted-foreground">
            Nothing confirmed yet. Switch to Elise Moretti in the menu above to see a Prep day at Milawa already booked.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {confirmed.map(({ application, opening }) => {
              if (!opening) return null
              const school = store.state.schools.find((item) => item.id === opening.schoolId)
              return (
                <li key={application.id} className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-sm text-moss">Confirmed</p>
                  <p className="font-display text-2xl">{school?.short}</p>
                  <p className="text-sm">
                    {opening.role} · {opening.gradeLabel} · {describeWhen(opening)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl">Schools you work with</h2>
          <ul className="mt-4 space-y-2">
            {schools.map((school) => (
              <li key={school.id} className="rounded-3xl border border-border bg-card px-4 py-3">
                <p className="font-medium">{school.short}</p>
                <p className="text-sm text-muted-foreground">
                  {school.town} · {school.sector}
                </p>
              </li>
            ))}
          </ul>
          <Link href="/crt/profile" className="mt-3 inline-block text-sm underline">
            Change schools
          </Link>
        </div>
        <div className="rounded-3xl bg-ink p-6 text-cream">
          <h2 className="font-display text-3xl">On file</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-cream/70">VIT</dt>
              <dd>{store.crt.vit || "Add it on your profile"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cream/70">Expires</dt>
              <dd>{store.crt.vitExpiry || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cream/70">WWCC</dt>
              <dd>{store.crt.wwcc || "—"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-cream/70">Sample numbers for the demo, not a real registration.</p>
        </div>
      </section>
    </div>
  )
}
