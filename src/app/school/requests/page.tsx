"use client"

import Link from "next/link"
import { toast } from "sonner"
import { Portrait } from "@/components/portrait"
import { Button } from "@/components/ui/button"
import { audienceLabel, crtsWhoCanSee } from "@/lib/access"
import { describeWhen, fullName, statusLabel } from "@/lib/format"
import { useNeCrt } from "@/lib/store"
import { SPECIALIST_ROLES } from "@/lib/types"

export default function RequestsPage() {
  const store = useNeCrt()
  if (!store.ready) return null

  const posted = [...store.schoolOpenings].sort((a, b) => {
    const aDate = a.slots[0]?.date ?? ""
    const bDate = b.slots[0]?.date ?? ""
    return aDate.localeCompare(bDate)
  })
  const history = store.state.applications.filter((application) => {
    const opening = store.state.openings.find((item) => item.id === application.openingId)
    return opening?.schoolId === store.school.id && application.status !== "pending"
  })

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-moss uppercase">Inbox</p>
      <h1 className="mt-1 font-display text-4xl sm:text-5xl">Requests</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Ask for a sport teacher, a music day, or any other role. Then confirm the CRT who wants it.
      </p>

      <section className="mt-8 rounded-3xl bg-teal-deep p-5 text-cream sm:p-6" aria-labelledby="specialty-heading">
        <h2 id="specialty-heading" className="font-display text-3xl">
          Ask for someone specific
        </h2>
        <p className="mt-2 max-w-xl text-sm text-cream/80">
          Pick a role. You’ll set the days, the year level, and who can see it on the next screen.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {SPECIALIST_ROLES.filter((role) => role !== "Classroom").map((role) => (
            <li key={role}>
              <Link
                href={`/school/request?role=${encodeURIComponent(role)}`}
                className="inline-flex min-h-11 items-center rounded-full bg-cream px-4 text-sm font-medium text-ink outline-none focus-visible:ring-3 focus-visible:ring-wattle"
              >
                {role}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="incoming-heading">
        <h2 id="incoming-heading" className="font-display text-3xl">
          Who wants the day
        </h2>
        {store.pending.length === 0 ? (
          <p className="mt-3 max-w-xl text-muted-foreground">
            Nothing waiting. When a CRT taps “I’ll take this”, their name shows up here and you can confirm them.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {store.pending.map((application) => {
              const person = store.state.crts.find((item) => item.id === application.crtId)
              const opening = store.state.openings.find((item) => item.id === application.openingId)
              if (!person || !opening) return null
              return (
                <li key={application.id} className="rounded-3xl border border-border bg-card p-4 sm:p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <Portrait look={person.look} photo={person.photo} className="size-16" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-2xl">{fullName(person)}</p>
                      <p className="text-sm text-muted-foreground">
                        {opening.role} · {opening.gradeLabel} · {describeWhen(opening)}
                      </p>
                      {application.note ? <p className="mt-2">{application.note}</p> : null}
                      <Link href={`/school/crts/${person.id}`} className="mt-2 inline-block text-sm underline">
                        See resume
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => {
                        store.confirmApplication(application.id)
                        toast.success(`${person.firstName} is booked`)
                      }}
                    >
                      Confirm {person.firstName}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        store.passApplication(application.id)
                        toast(`${person.firstName} can still see other days`)
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

      <section className="mt-10" aria-labelledby="posted-heading">
        <h2 id="posted-heading" className="font-display text-3xl">
          Days you’ve pushed out
        </h2>
        {posted.length === 0 ? (
          <p className="mt-3 text-muted-foreground">
            Nothing live.{" "}
            <Link href="/school/request" className="underline">
              Request a CRT
            </Link>{" "}
            to put a day on the list.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {posted.map((opening) => {
              const filled = store.state.crts.find((person) => person.id === opening.filledByCrtId)
              const seeing = crtsWhoCanSee(store.state, opening)
              return (
                <li key={opening.id} className="rounded-3xl border border-border bg-card p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{statusLabel(opening.status)}</p>
                      <h3 className="font-display text-2xl">
                        {opening.role} · {opening.gradeLabel}
                      </h3>
                      <p className="mt-1 text-sm">{describeWhen(opening)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{audienceLabel(store.state, opening)}</p>
                      {opening.notes ? <p className="mt-2 text-sm">{opening.notes}</p> : null}
                      {filled ? (
                        <p className="mt-2 text-sm font-medium">Booked with {fullName(filled)}</p>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Visible to {seeing.length} {seeing.length === 1 ? "CRT" : "CRTs"}
                          {seeing.length > 0 ? `: ${seeing.map((person) => person.firstName).join(", ")}` : ""}
                        </p>
                      )}
                    </div>
                    {opening.status === "open" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          store.withdrawOpening(opening.id)
                          toast("Request withdrawn")
                        }}
                      >
                        Withdraw
                      </Button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {history.length > 0 ? (
        <section className="mt-10" aria-labelledby="history-heading">
          <h2 id="history-heading" className="font-display text-2xl">
            Earlier replies
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {history.map((application) => {
              const person = store.state.crts.find((item) => item.id === application.crtId)
              const opening = store.state.openings.find((item) => item.id === application.openingId)
              if (!person || !opening) return null
              return (
                <li key={application.id} className="rounded-2xl bg-card px-4 py-3">
                  {fullName(person)} · {opening.gradeLabel} · {statusLabel(application.status)}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
