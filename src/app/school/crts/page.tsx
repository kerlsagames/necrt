"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
import { Portrait } from "@/components/portrait"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { fullName } from "@/lib/format"
import { useNeCrt } from "@/lib/store"
import { cn } from "cn"

type Filter = "all" | "favourites" | "hidden"

export default function CrtListPage() {
  const store = useNeCrt()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const people = useMemo(() => {
    if (!store.ready) return []
    const needle = query.trim().toLowerCase()
    return store.crtsAtSchool.filter((person) => {
      const favourite = store.favouriteIds.includes(person.id)
      const hidden = store.hiddenIds.includes(person.id)
      if (filter === "favourites" && !favourite) return false
      if (filter === "hidden" && !hidden) return false
      if (!needle) return true
      const haystack = `${fullName(person)} ${person.town} ${person.specialties.join(" ")}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [store, query, filter])

  if (!store.ready) return null

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-moss uppercase">People</p>
      <h1 className="mt-1 font-display text-4xl sm:text-5xl">Your CRTs</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        These teachers have chosen {store.school.short}. Open a name for the resume. Switch someone off if they
        shouldn’t see your available days. A favourite can be the only group you push a day to.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="crt-search">Search</Label>
          <Input
            id="crt-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, town, or specialty"
            className="mt-1 h-11 text-base"
          />
        </div>
        <fieldset>
          <legend className="sr-only">Filter the list</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["favourites", "Favourites"],
                ["hidden", "Switched off"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm focus-within:ring-3 focus-within:ring-ring",
                  filter === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                )}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name="crt-filter"
                  checked={filter === value}
                  onChange={() => setFilter(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {people.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No one matches. Clear the search, or check another filter.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {people.map((person) => {
            const favourite = store.favouriteIds.includes(person.id)
            const hidden = store.hiddenIds.includes(person.id)
            return (
              <li key={person.id} className="rounded-3xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Portrait look={person.look} photo={person.photo} className="size-16" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/school/crts/${person.id}`}
                      className="font-display text-2xl underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      {fullName(person)}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {person.town} · {person.specialties.join(" · ")}
                    </p>
                    {hidden && favourite ? (
                      <p className="mt-1 text-sm text-clay-deep">
                        Favourite, but switched off — they still won’t see days.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      aria-pressed={favourite}
                      onClick={() => store.toggleFavourite(person.id)}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring",
                        favourite ? "border-wattle bg-wattle text-ink" : "border-border bg-paper",
                      )}
                    >
                      <Star className={cn("size-4", favourite && "fill-current")} />
                      {favourite ? "Favourited" : "Favourite"}
                    </button>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`see-${person.id}`} className="text-sm">
                        Can see days
                      </Label>
                      <Switch
                        id={`see-${person.id}`}
                        checked={!hidden}
                        onCheckedChange={() => store.toggleHidden(person.id)}
                        aria-label={`${fullName(person)} can see available days`}
                      />
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
