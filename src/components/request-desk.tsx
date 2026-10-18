"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { CalendarBoard } from "@/components/calendar-board"
import { Segmented } from "@/components/segmented"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { isSchoolDay, parseIso, schoolDaysBetween, startOfMonth } from "@/lib/dates"
import { formatShort, portionLabel } from "@/lib/format"
import { crtsWhoCanSee } from "@/lib/access"
import { useNeCrt, type OpeningDraft } from "@/lib/store"
import { SPECIALIST_ROLES, type Audience, type Portion } from "@/lib/types"
import { cn } from "cn"

const PORTIONS: { value: Portion; label: string }[] = [
  { value: "full", label: "Full day" },
  { value: "am", label: "Morning" },
  { value: "pm", label: "Afternoon" },
]

export function RequestDesk() {
  const store = useNeCrt()
  const today = store.ready ? store.state.today : "2026-10-18"
  const router = useRouter()
  const params = useSearchParams()
  const presetRole = params.get("role")
  const presetAudience = params.get("audience")
  const [mode, setMode] = useState<"days" | "block">("days")
  const [slots, setSlots] = useState<{ date: string; portion: Portion }[]>([])
  const [blockStart, setBlockStart] = useState("")
  const [blockEnd, setBlockEnd] = useState("")
  const [blockPortion, setBlockPortion] = useState<Portion>("full")
  const [gradeId, setGradeId] = useState("general")
  const [role, setRole] = useState(
    presetRole && (SPECIALIST_ROLES as readonly string[]).includes(presetRole) ? presetRole : "Classroom",
  )
  const [notes, setNotes] = useState("")
  const [audience, setAudience] = useState<Audience>(
    presetAudience === "favourites" || presetAudience === "selected" ? presetAudience : "list",
  )
  const [selectedCrtIds, setSelectedCrtIds] = useState<string[]>([])
  const [month, setMonth] = useState(() => startOfMonth(parseIso(today)))
  const [error, setError] = useState("")

  const draft = useMemo<OpeningDraft | null>(() => {
    if (!store.ready) return null
    return {
      mode,
      slots,
      blockStart,
      blockEnd,
      blockPortion,
      gradeId,
      role,
      notes,
      audience,
      selectedCrtIds,
    }
  }, [store.ready, mode, slots, blockStart, blockEnd, blockPortion, gradeId, role, notes, audience, selectedCrtIds])

  if (!store.ready || !draft) return null
  const desk = store

  const school = desk.school
  const hiddenPeople = desk.crtsAtSchool.filter((person) => desk.hiddenIds.includes(person.id))
  const visiblePeople = desk.crtsAtSchool.filter((person) => !desk.hiddenIds.includes(person.id))
  const previewOpening = {
    id: "preview",
    schoolId: school.id,
    mode,
    slots:
      mode === "block"
        ? schoolDaysBetween(blockStart, blockEnd).map((date) => ({ date, portion: blockPortion }))
        : slots,
    blockStart: mode === "block" ? blockStart : undefined,
    blockEnd: mode === "block" ? blockEnd : undefined,
    blockPortion: mode === "block" ? blockPortion : undefined,
    gradeId,
    gradeLabel: gradeId === "general" ? "General duties" : (school.grades.find((grade) => grade.id === gradeId)?.label ?? ""),
    role,
    notes,
    audience,
    selectedCrtIds,
    status: "open" as const,
    createdAt: "",
  }
  const recipients = crtsWhoCanSee(desk.state, previewOpening)
  const selectedDates = mode === "days" ? slots.map((slot) => slot.date) : [blockStart, blockEnd].filter(Boolean)
  const rangeDates = mode === "block" ? schoolDaysBetween(blockStart, blockEnd) : []
  const marks = desk.schoolOpenings.flatMap((opening) => opening.slots.map((slot) => slot.date))

  function pick(date: string) {
    setError("")
    if (mode === "block") {
      if (!blockStart || (blockStart && blockEnd)) {
        setBlockStart(date)
        setBlockEnd("")
        return
      }
      if (date < blockStart) {
        setBlockEnd(blockStart)
        setBlockStart(date)
        return
      }
      setBlockEnd(date)
      return
    }
    setSlots((current) => {
      if (current.some((slot) => slot.date === date)) {
        return current.filter((slot) => slot.date !== date)
      }
      return [...current, { date, portion: "full" as Portion }].sort((a, b) => a.date.localeCompare(b.date))
    })
  }

  const push = () => {
    if (mode === "days" && slots.length === 0) {
      setError("Choose at least one school day.")
      return
    }
    if (mode === "block" && schoolDaysBetween(blockStart, blockEnd).length === 0) {
      setError("Set a start and finish that include at least one school day.")
      return
    }
    if (recipients.length === 0) {
      setError("Nobody on your list can see this yet. Switch a CRT back on, or choose a different group.")
      return
    }
    const result = desk.pushOpening(draft)
    toast.success("Day pushed out", {
      description: `${result.count} ${result.count === 1 ? "CRT can" : "CRTs can"} see it.`,
    })
    router.push("/school/requests")
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div>
        <p className="text-sm font-medium tracking-wide text-moss uppercase">Cover</p>
        <h1 className="mt-1 font-display text-4xl text-balance sm:text-5xl">Request a CRT</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Pick the days, say what they’re covering, then push it out. Half days are fine.
        </p>
        <div className="mt-5">
          <Segmented
            label="What kind of cover"
            name="cover-mode"
            value={mode}
            onChange={(next) => {
              setMode(next)
              setError("")
              if (next === "block" && slots.length > 0) {
                setBlockStart(slots[0].date)
                setBlockEnd(slots[slots.length - 1].date)
              }
            }}
            options={[
              { value: "days", label: "Chosen days" },
              { value: "block", label: "A block of days" },
            ]}
          />
        </div>
        <div className="mt-4">
          <CalendarBoard
            month={month}
            onMonth={setMonth}
            selected={mode === "days" ? selectedDates : rangeDates}
            onPick={pick}
            disabled={(date) => !isSchoolDay(date, desk.state.today)}
            marks={marks}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          A clay dot means this school already has a request that day. You can still add another.
        </p>
      </div>

      <div className="space-y-5 lg:sticky lg:top-4">
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-2xl">The day</h2>
          {mode === "block" ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="block-start">First day</Label>
                  <input
                    id="block-start"
                    type="date"
                    value={blockStart}
                    onChange={(event) => setBlockStart(event.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3"
                  />
                </div>
                <div>
                  <Label htmlFor="block-end">Last day</Label>
                  <input
                    id="block-end"
                    type="date"
                    value={blockEnd}
                    onChange={(event) => setBlockEnd(event.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3"
                  />
                </div>
              </div>
              <Segmented
                label="How much of each day"
                name="block-portion"
                value={blockPortion}
                onChange={setBlockPortion}
                options={PORTIONS}
              />
              <p className="text-sm text-muted-foreground">
                {rangeDates.length > 0
                  ? `${rangeDates.length} school days, weekends left out.`
                  : "Click a start day, then a finish day. Or type the dates."}
              </p>
            </div>
          ) : slots.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No days yet. Tap a weekday on the calendar.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {slots.map((slot) => (
                <li key={slot.date} className="rounded-2xl bg-paper p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-medium">{formatShort(slot.date)}</p>
                    <button
                      type="button"
                      className="text-sm underline"
                      onClick={() => setSlots((current) => current.filter((item) => item.date !== slot.date))}
                    >
                      Remove
                    </button>
                  </div>
                  <Segmented
                    label={`Length for ${formatShort(slot.date)}`}
                    name={`portion-${slot.date}`}
                    value={slot.portion}
                    onChange={(portion) =>
                      setSlots((current) => current.map((item) => (item.date === slot.date ? { ...item, portion } : item)))
                    }
                    options={PORTIONS}
                  />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">{school.dayShape}</p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-2xl">What they are covering</h2>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium">Year level</legend>
            <div className="flex flex-wrap gap-2">
              <GradeChip
                selected={gradeId === "general"}
                onClick={() => setGradeId("general")}
                label="General duties"
              />
              {school.grades.map((grade) => (
                <GradeChip
                  key={grade.id}
                  selected={gradeId === grade.id}
                  onClick={() => setGradeId(grade.id)}
                  label={grade.label}
                />
              ))}
            </div>
          </fieldset>
          <div className="mt-4">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3"
            >
              {SPECIALIST_ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="General duties">General duties</option>
            </select>
          </div>
          <div className="mt-4">
            <Label htmlFor="notes">Note for the CRT</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Where the plans are, yard duty, anything odd about the day."
              className="mt-1 min-h-28 text-base"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-2xl">Who can see it</h2>
          <Segmented
            label="Audience"
            name="audience"
            value={audience}
            onChange={setAudience}
            options={[
              { value: "list", label: `Everyone on the list (${visiblePeople.length})` },
              { value: "favourites", label: `Favourites (${desk.favouriteIds.filter((id) => visiblePeople.some((person) => person.id === id)).length})` },
              { value: "selected", label: "Choose people" },
            ]}
          />
          {audience === "selected" ? (
            <ul className="mt-4 space-y-2">
              {visiblePeople.map((person) => {
                const checked = selectedCrtIds.includes(person.id)
                return (
                  <li key={person.id}>
                    <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-border px-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => {
                          setSelectedCrtIds((current) =>
                            next ? [...current, person.id] : current.filter((id) => id !== person.id),
                          )
                        }}
                      />
                      <span>
                        {person.firstName} {person.lastName}
                        <span className="block text-sm text-muted-foreground">{person.specialties.slice(0, 2).join(" · ")}</span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          ) : null}
          {hiddenPeople.length > 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Switched off, so they won’t see this: {hiddenPeople.map((person) => person.firstName).join(", ")}.
            </p>
          ) : null}
          <p className="mt-3 text-sm" aria-live="polite">
            {recipients.length === 0
              ? "No CRTs will see this yet."
              : `${recipients.length} ${recipients.length === 1 ? "CRT" : "CRTs"} will see it: ${recipients
                  .map((person) => person.firstName)
                  .join(", ")}.`}
          </p>
        </section>

        {error ? (
          <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="button" size="lg" className="w-full" onClick={push}>
          Push {mode === "block" ? "this block" : slots.length > 1 ? "these days" : "this day"} out
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {portionLabel(mode === "block" ? blockPortion : (slots[0]?.portion ?? "full"))} cover for {school.short}. The
          school still confirms who gets it.
        </p>
      </div>
    </div>
  )
}

function GradeChip({
  selected,
  onClick,
  label,
}: {
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-4 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring",
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-paper",
      )}
    >
      {label}
    </button>
  )
}
