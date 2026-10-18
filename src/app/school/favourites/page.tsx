"use client"

import Link from "next/link"
import { Portrait } from "@/components/portrait"
import { fullName } from "@/lib/format"
import { useNeCrt } from "@/lib/store"

export default function FavouritesPage() {
  const store = useNeCrt()
  if (!store.ready) return null
  const people = store.crtsAtSchool.filter((person) => store.favouriteIds.includes(person.id))

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-moss uppercase">Saved</p>
      <h1 className="mt-1 font-display text-4xl sm:text-5xl">Favourites</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Keep the CRTs you trust close. You can push a day to favourites only, so the rest of the list doesn’t see it.
      </p>
      <Link
        href="/school/request?audience=favourites"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-medium text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        Request a day for favourites
      </Link>

      {people.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No favourites yet.{" "}
          <Link href="/school/crts" className="underline">
            Star someone on your CRT list.
          </Link>
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {people.map((person) => {
            const hidden = store.hiddenIds.includes(person.id)
            return (
              <li key={person.id}>
                <Link
                  href={`/school/crts/${person.id}`}
                  className="desk-card flex items-center gap-4 border border-border bg-card p-4"
                >
                  <Portrait look={person.look} photo={person.photo} className="size-16" />
                  <span>
                    <span className="block font-display text-2xl">{fullName(person)}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {person.specialties.slice(0, 3).join(" · ")}
                    </span>
                    {hidden ? (
                      <span className="mt-1 block text-sm text-clay-deep">Switched off — won’t see days.</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
