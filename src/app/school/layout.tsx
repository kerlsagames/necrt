"use client"

import { CalendarPlus, Inbox, LayoutDashboard, Star, Users } from "lucide-react"
import { DeskShell } from "@/components/shell"
import { useNeCrt } from "@/lib/store"

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const store = useNeCrt()
  const waiting = store.ready ? store.pending.length : 0
  return (
    <DeskShell
      tone="school"
      sideLabel="School desk"
      otherHref="/crt"
      otherLabel="CRT side"
      settingsHref="/school/settings"
      items={[
        { href: "/school", label: "Desk", short: "Desk", icon: LayoutDashboard, exact: true },
        { href: "/school/request", label: "Request a CRT", short: "Request", icon: CalendarPlus },
        {
          href: "/school/requests",
          label: "Requests",
          short: "Requests",
          icon: Inbox,
          badge: waiting || undefined,
        },
        { href: "/school/crts", label: "Your CRTs", short: "CRTs", icon: Users },
        { href: "/school/favourites", label: "Favourites", short: "Favourites", icon: Star },
      ]}
    >
      {children}
    </DeskShell>
  )
}
