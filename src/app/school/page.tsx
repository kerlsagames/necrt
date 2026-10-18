"use client"

import Link from "next/link"
import { toast } from "sonner"
import { Portrait } from "@/components/portrait"
import { Button } from "@/components/ui/button"
import { parseIso, upcomingWeekdays } from "@/lib/dates"
import { describeWhen, formatShort, fullName } from "@/lib/format"
import { useNeCrt } from "@/lib/store"

export default function SchoolDeskPage() {
  const store = useNeCrt()
  if (!store.ready) return null

  const days = upcomingWeekdays(8, parseIso(store.state.today))
  const favourites = store.crtsAtSchool.filter((person) => store.favouriteIds.includes(person.id))

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-moss uppercase">{store.school.town}</p>
      <h1 className="mt-1 max-w-3xl font-display text-4xl text-balance sm:text-6xl">{store.school.short}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{store.school.about}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Link href="/school/request" className="desk-card min-h-52 bg-teal-deep p-6 text-cream sm:p-8">
          <p className="text-sm tracking-wide text-wattle uppercase">Cover</p>
          <p className="mt-3 font-display text-4xl sm:text-5xl">Request a CRT</p>
          <p className="mt-3 max-w-md text-cream/85">
            Choose a day, a few days, a half day, or a whole block. Then push it out to your list.
          </p>
        </Link>
        <div className="grid gap-4">
          <Link href="/school/requests" className="desk-card border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Inbox</p>
            <p className="mt-1 font-display text-3xl">Requests</p>
            <p className="mt-2 text-sm">
              {store.pending.length > 0
                ? `${store.pending.length} ${store.pending.length === 1 ? "CRT is" : "CRTs are"} waiting for a yes.`
                : "Specialty roles, and the people who want your days."}
            </p>
          </Link>
          <Link href="/school/crts" className="desk-card border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">People</p>
            <p className="mt-1 font-display text-3xl">Your CRTs</p>
            <p className="mt-2 text-sm">{store.crtsAtSchool.length} have chosen to work at this school.</p>
          </Link>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="fortnight-heading">
        <h2 id="fortnight-heading" className="font-display text-3xl">
          Coming up
        </h2>
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {days.map((date) => {
            const openings = store.schoolOpenings.filter((opening) => opening.slots.some((slot) => slot.date === date))
            return (
              <li key={date} className="flex flex-wrap items-start gap-3 px-4 py-3 sm:px-5">
                <p className="w-28 shrink-0 font-medium">{formatShort(date)}</p>
                {openings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No cover out</p>
                ) : (
                  <ul className="space-y-1">
                    {openings.map((opening) => {
                      const filled = store.state.crts.find((person) => person.id === opening.filledByCrtId)
                      return (
                        <li key={opening.id} className="text-sm">
                          <span className="font-medium">
                            {opening.gradeLabel} · {opening.role}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {opening.status === "filled" && filled ? `Filled by ${filled.firstName}` : opening.status === "open" ? "Open" : opening.status}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="waiting-heading">
        <div className="flex items-end justify-between gap-3">
          <h2 id="waiting-heading" className="font-display text-3xl">
            Waiting on you
          </h2>
          <Link href="/school/requests" className="text-sm font-medium underline">
            All requests
          </Link>
        </div>
        {store.pending.length === 0 ? (
          <p className="mt-3 text-muted-foreground">
            When a CRT takes a day, they land here for you to confirm. Try the Friday morning at Appin Park if you reset
            the demo.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {store.pending.map((application) => {
              const person = store.state.crts.find((item) => item.id === application.crtId)
              const opening = store.state.openings.find((item) => item.id === application.openingId)
              if (!person || !opening) return null
              return (
                <li key={application.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-border bg-card p-4">
                  <Portrait look={person.look} photo={person.photo} className="size-14" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{fullName(person)}</p>
                    <p className="text-sm text-muted-foreground">
                      {describeWhen(opening)} · {opening.gradeLabel}
                    </p>
                    {application.note ? <p className="mt-1 text-sm">{application.note}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => {
                        store.confirmApplication(application.id)
                        toast.success(`${person.firstName} is confirmed`)
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        store.passApplication(application.id)
                        toast(`${person.firstName} won’t be taking this one`)
                      }}
                    >
                      Not this time
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2" aria-labelledby="also-heading">
        <div>
          <h2 id="also-heading" className="font-display text-3xl">
            Also on this desk
          </h2>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/school/favourites" className="desk-card border border-border bg-card px-4 py-3">
                Favourites
                <span className="mt-1 block text-sm text-muted-foreground">
                  {favourites.length > 0
                    ? favourites.map((person) => person.firstName).join(", ")
                    : "Star the CRTs you want first call on a day."}
                </span>
              </Link>
            </li>
            <li>
              <Link href="/school/settings" className="desk-card border border-border bg-card px-4 py-3">
                School settings
                <span className="mt-1 block text-sm text-muted-foreground">
                  Year levels, the note CRTs read, and how a day is split.
                </span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-3xl bg-teal-deep p-6 text-cream">
          <h2 className="font-display text-3xl">How a day moves</h2>
          <ol className="mt-4 space-y-3 text-sm text-cream/90">
            <li>1. You push the day. Hidden CRTs never see it.</li>
            <li>2. A CRT on your list taps “I’ll take this”.</li>
            <li>3. You confirm. Everyone else is told it’s filled.</li>
          </ol>
          <p className="mt-4 text-sm text-cream/75">
            {store.schoolOpenings.filter((opening) => opening.status === "open").length} open{" "}
            {store.schoolOpenings.filter((opening) => opening.status === "open").length === 1 ? "request" : "requests"}{" "}
            on this desk right now.
          </p>
        </div>
      </section>
    </div>
  )
}
