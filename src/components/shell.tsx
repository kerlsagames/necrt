"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Settings } from "lucide-react"
import { toast } from "sonner"
import { Wordmark } from "@/components/brand"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useNeCrt } from "@/lib/store"
import { cn } from "cn"

export type DeskItem = {
  href: string
  label: string
  short: string
  icon: LucideIcon
  badge?: number
  badgeLabel?: string
  exact?: boolean
}

export function DeskShell({
  tone,
  sideLabel,
  otherHref,
  otherLabel,
  items,
  settingsHref,
  children,
}: {
  tone: "school" | "crt"
  sideLabel: string
  otherHref: string
  otherLabel: string
  items: DeskItem[]
  settingsHref?: string
  children: React.ReactNode
}) {
  const store = useNeCrt()
  if (!store.ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
        <p className="font-display text-3xl">Opening the NECRT desk…</p>
      </div>
    )
  }

  return (
    <div data-tone={tone} className="min-h-dvh bg-paper text-foreground">
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Wordmark />
          <p className="text-sm text-muted-foreground">{sideLabel}</p>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {tone === "school" ? (
              <Select
                value={store.school.id}
                onValueChange={(value) => {
                  if (value) store.setActiveSchool(value)
                }}
              >
                <SelectTrigger className="h-11 min-w-44" aria-label="School you are viewing as">
                  <SelectValue>
                    {(value) => store.state.schools.find((school) => school.id === value)?.short ?? "Choose a school"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {store.state.schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.short}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={store.crt.id}
                onValueChange={(value) => {
                  if (value) store.setActiveCrt(value)
                }}
              >
                <SelectTrigger className="h-11 min-w-48" aria-label="CRT you are viewing as">
                  <SelectValue>
                    {(value) => {
                      const person = store.state.crts.find((item) => item.id === value)
                      return person ? `${person.firstName} ${person.lastName}` : "Choose a CRT"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {store.state.crts.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {settingsHref ? (
              <Link
                href={settingsHref}
                aria-label="School settings"
                className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
              >
                <Settings />
              </Link>
            ) : null}
            <Link href={otherHref} className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              {otherLabel}
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-wattle/35 px-4 py-2 text-sm">
          <p>Demo mode. Login is off, so both sides share this browser. Names, VIT numbers and bookings are samples.</p>
          <button
            type="button"
            className="font-medium underline underline-offset-2"
            onClick={() => {
              store.resetDemo()
              toast.success("Demo reset", { description: "Sample days are back to the start." })
            }}
          >
            Reset demo
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl md:grid-cols-[220px_1fr]">
        <nav aria-label={sideLabel} className="hidden border-r border-border px-3 py-6 md:block">
          <Suspense fallback={<DeskNav items={items} pathname="" />}>
            <DeskNavLive items={items} />
          </Suspense>
        </nav>
        <main id="content" className="min-w-0 px-4 py-6 pb-28 md:px-8 md:pb-16">
          {children}
        </main>
      </div>
        <nav
        aria-label={sideLabel}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden"
      >
        <Suspense fallback={<DeskNav items={items} pathname="" compact />}>
          <DeskNavLive items={items} compact />
        </Suspense>
      </nav>
    </div>
  )
}

function DeskNavLive({ items, compact = false }: { items: DeskItem[]; compact?: boolean }) {
  const pathname = usePathname()
  return <DeskNav items={items} pathname={pathname} compact={compact} />
}

function DeskNav({
  items,
  pathname,
  compact = false,
}: {
  items: DeskItem[]
  pathname: string
  compact?: boolean
}) {
  return (
    <ul className={compact ? "flex" : "space-y-1"}>
      {items.map((item) => (
        <li key={item.href} className={compact ? "min-w-0 flex-1" : undefined}>
          <DeskLink item={item} compact={compact} pathname={pathname} />
        </li>
      ))}
    </ul>
  )
}

function DeskLink({
  item,
  compact = false,
  pathname,
}: {
  item: DeskItem
  compact?: boolean
  pathname: string
}) {
  const active = pathname
    ? item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
    : false
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex outline-none focus-visible:ring-3 focus-visible:ring-ring",
        compact
          ? "relative min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] leading-tight"
          : "min-h-11 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium",
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
      )}
    >
      <Icon className={compact ? "size-5" : "size-4"} />
      <span className={compact ? "text-center" : "flex-1"}>{compact ? item.short : item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            "grid min-w-5 place-items-center rounded-full px-1 text-xs",
            active ? "bg-cream text-ink" : "bg-clay text-cream",
            compact && "absolute top-1 right-1",
          )}
        >
          <span className="sr-only">
            {item.badge} {item.badgeLabel ?? "waiting"}
          </span>
          <span aria-hidden>{item.badge}</span>
        </span>
      ) : null}
    </Link>
  )
}
