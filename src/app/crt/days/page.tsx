"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { crtCanSee } from "@/lib/access"
import { describeWhen, statusLabel } from "@/lib/format"
import { useNeCrt } from "@/lib/store"

export default function AvailableDaysPage() {
  const store = useNeCrt()
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [note, setNote] = useState("")
  if (!store.ready) return null
  const desk = store

  const openings = desk.state.openings
    .filter((opening) => opening.status !== "withdrawn" && crtCanSee(desk.state, desk.crt.id, opening))
    .sort((a, b) => (a.slots[0]?.date ?? "").localeCompare(b.slots[0]?.date ?? ""))

  const grouped = desk.state.schools
    .filter((school) => desk.crt.schoolIds.includes(school.id))
    .map((school) => ({
      school,
      openings: openings.filter((opening) => opening.schoolId === school.id),
    }))

  const active = openings.find((opening) => opening.id === openingId)

  function send() {
    if (!openingId) return
    desk.applyToOpening(openingId, note)
    toast.success("Sent to the school", { description: "They’ll confirm before the day is yours." })
    setOpeningId(null)
    setNote("")
  }

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-clay-deep uppercase">Work</p>
      <h1 className="mt-1 font-display text-4xl sm:text-5xl">Available days</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Only schools you’ve joined, and only days they haven’t hidden from you. Taking a day tells the school you’re
        interested. It isn’t booked until they confirm.
      </p>

      {store.crt.schoolIds.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          You haven’t joined a school yet. Add one on your profile and their days will show up here.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {grouped.map(({ school, openings: schoolOpenings }) => (
            <section key={school.id} aria-labelledby={`school-${school.id}`}>
              <h2 id={`school-${school.id}`} className="font-display text-3xl">
                {school.short}
              </h2>
              <p className="text-sm text-muted-foreground">
                {school.town} · {school.sector}
              </p>
              {schoolOpenings.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No days from this school right now.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {schoolOpenings.map((opening) => {
                    const application = desk.state.applications.find(
                      (item) => item.openingId === opening.id && item.crtId === desk.crt.id && item.status !== "withdrawn",
                    )
                    const takenByOther = opening.status === "filled" && opening.filledByCrtId !== store.crt.id
                    const mine = opening.status === "filled" && opening.filledByCrtId === store.crt.id
                    return (
                      <li key={opening.id} className="rounded-3xl border border-border bg-card p-4 sm:p-5">
                        <p className="text-sm text-muted-foreground">
                          {mine ? "Confirmed for you" : takenByOther ? "Already taken" : application ? statusLabel(application.status) : "Open"}
                        </p>
                        <h3 className="font-display text-2xl">
                          {opening.role} · {opening.gradeLabel}
                        </h3>
                        <p className="mt-1">{describeWhen(opening)}</p>
                        {opening.notes ? <p className="mt-2 text-sm">{opening.notes}</p> : null}
                        <p className="mt-2 text-sm text-muted-foreground">{school.dayShape}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{school.crtNotes}</p>
                        <div className="mt-4">
                          {opening.status === "open" && (!application || application.status === "passed") ? (
                            <Button
                              type="button"
                              size="lg"
                              onClick={() => {
                                setOpeningId(opening.id)
                                setNote(application?.note ?? "")
                              }}
                            >
                              I’ll take this
                            </Button>
                          ) : null}
                          {application?.status === "pending" ? (
                            <Button
                              type="button"
                              size="lg"
                              variant="outline"
                              onClick={() => {
                                desk.withdrawApplication(application.id)
                                toast("Application withdrawn")
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
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) {
            setOpeningId(null)
            setNote("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take this day</DialogTitle>
            <DialogDescription>
              {active ? `${active.role} · ${active.gradeLabel}. ${describeWhen(active)}.` : ""} The school confirms
              before it’s booked.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="apply-note">Note to the school</Label>
            <Textarea
              id="apply-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional. Say if you know the class, or if you can only do part of a block."
              className="mt-1 min-h-28 text-base"
            />
          </div>
          <DialogFooter>
            <Button type="button" size="lg" onClick={send}>
              Send to the school
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
