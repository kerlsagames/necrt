"use client"

import { CalendarDays, LayoutDashboard, UserRound, BookmarkCheck } from "lucide-react"
import { DeskShell } from "@/components/shell"
import { useNeCrt } from "@/lib/store"
import { crtCanSee } from "@/lib/access"

export default function CrtLayout({ children }: { children: React.ReactNode }) {
  const store = useNeCrt()
  const openDays = store.ready
    ? store.state.openings.filter(
        (opening) => opening.status === "open" && crtCanSee(store.state, store.crt.id, opening),
      ).length
    : 0
  return (
    <DeskShell
      tone="crt"
      sideLabel="CRT desk"
      otherHref="/school"
      otherLabel="School side"
      items={[
        { href: "/crt", label: "Desk", short: "Desk", icon: LayoutDashboard, exact: true },
        {
          href: "/crt/days",
          label: "Available days",
          short: "Days",
          icon: CalendarDays,
          badge: openDays || undefined,
          badgeLabel: "open",
        },
        { href: "/crt/bookings", label: "My bookings", short: "Bookings", icon: BookmarkCheck },
        { href: "/crt/profile", label: "Profile", short: "Profile", icon: UserRound },
      ]}
    >
      {children}
    </DeskShell>
  )
}
