"use client"

import { use } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
import { Portrait } from "@/components/portrait"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { fullName } from "@/lib/format"
import { useNeCrt } from "@/lib/store"
import { cn } from "cn"

export function CrtResume({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const store = useNeCrt()
  if (!store.ready) return null

  const person = store.state.crts.find((item) => item.id === id)
  if (!person || !person.schoolIds.includes(store.school.id)) {
    return (
      <div>
        <h1 className="font-display text-4xl">Not on this list</h1>
        <p className="mt-2 text-muted-foreground">That CRT hasn’t chosen {store.school.short}.</p>
        <Link href="/school/crts" className="mt-4 inline-block underline">
          Back to your CRTs
        </Link>
      </div>
    )
  }

  const favourite = store.favouriteIds.includes(person.id)
  const hidden = store.hiddenIds.includes(person.id)
  const schools = store.state.schools.filter((school) => person.schoolIds.includes(school.id))

  return (
    <article>
      <Link href="/school/crts" className="text-sm font-medium underline">
        Back to your CRTs
      </Link>
      <header className="mt-4 flex flex-wrap items-end gap-5">
        <Portrait look={person.look} photo={person.photo} className="size-28 sm:size-36" />
        <div>
          <p className="text-sm font-medium tracking-wide text-moss uppercase">Resume</p>
          <h1 className="font-display text-4xl sm:text-6xl">{fullName(person)}</h1>
          <p className="mt-2 text-muted-foreground">
            {person.town} · {person.years} years teaching · {person.specialties.join(" · ")}
          </p>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          aria-pressed={favourite}
          onClick={() => store.toggleFavourite(person.id)}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring",
            favourite ? "border-wattle bg-wattle text-ink" : "border-border bg-card",
          )}
        >
          <Star className={cn("size-4", favourite && "fill-current")} />
          {favourite ? "Favourited" : "Add to favourites"}
        </button>
        <div className="flex min-h-11 items-center gap-3 rounded-full border border-border bg-card px-4">
          <Label htmlFor="detail-see">Can see available days</Label>
          <Switch id="detail-see" checked={!hidden} onCheckedChange={() => store.toggleHidden(person.id)} />
        </div>
      </div>
      {hidden ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {person.firstName} stays on your list, but open days stay hidden from them until you switch this back on.
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-3xl">About</h2>
            <p className="mt-2 max-w-2xl text-lg">{person.bio}</p>
          </section>
          <section>
            <h2 className="font-display text-3xl">Qualifications</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {person.qualifications.filter(Boolean).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-3xl">Experience</h2>
            <ol className="mt-3 space-y-4">
              {person.experience.map((job) => (
                <li key={job.id}>
                  <p className="font-medium">
                    {job.role} · {job.org}
                  </p>
                  <p className="text-sm text-muted-foreground">{job.span}</p>
                  <p className="mt-1">{job.detail}</p>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="font-display text-3xl">Checks</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {person.checks.filter(Boolean).map((item) => (
                <li key={item} className="rounded-full bg-card px-3 py-2 text-sm">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">Sample registration details for this demo.</p>
          </section>
        </div>
        <aside className="h-fit rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-2xl">On file</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">VIT</dt>
              <dd className="font-medium">{person.vit || "Not added"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">VIT expiry</dt>
              <dd>{person.vitExpiry || "Not added"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">WWCC</dt>
              <dd>{person.wwcc || "Not added"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>
                <a className="underline" href={`tel:${person.phone.replace(/\s/g, "")}`}>
                  {person.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a className="underline" href={`mailto:${person.email}`}>
                  {person.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Also works with</dt>
              <dd>{schools.map((school) => school.short).join(", ")}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </article>
  )
}
