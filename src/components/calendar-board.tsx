"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addDays, addMonths, isWeekend, monthGrid, parseIso } from "@/lib/dates"
import { formatLong, formatMonth } from "@/lib/format"
import { cn } from "cn"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function CalendarBoard({
  month,
  onMonth,
  selected,
  onPick,
  disabled,
  marks = [],
}: {
  month: Date
  onMonth: (month: Date) => void
  selected: string[]
  onPick: (date: string) => void
  disabled: (date: string) => boolean
  marks?: string[]
}) {
  const weeks = monthGrid(month)
  const flat = weeks.flat().filter((day): day is string => Boolean(day))
  const [focus, setFocus] = useState<string | null>(null)
  const tabDate = focus && flat.includes(focus) ? focus : (flat.find((day) => !disabled(day)) ?? flat[0])

  function move(from: string, delta: number) {
    const next = addDays(from, delta)
    setFocus(next)
    const date = parseIso(next)
    if (date.getUTCMonth() !== month.getUTCMonth() || date.getUTCFullYear() !== month.getUTCFullYear()) {
      onMonth(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12)))
    }
    requestAnimationFrame(() => {
      document.getElementById(`necrt-day-${next}`)?.focus()
    })
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-3 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Previous month"
          onClick={() => onMonth(addMonths(month, -1))}
        >
          <ChevronLeft />
        </Button>
        <h2 className="font-display text-2xl">{formatMonth(month)}</h2>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Next month"
          onClick={() => onMonth(addMonths(month, 1))}
        >
          <ChevronRight />
        </Button>
      </div>
      <p id="calendar-help" className="mb-3 text-sm text-muted-foreground">
        Arrow keys move. Enter or Space selects a school day. Weekends stay closed.
      </p>
      <div role="grid" aria-labelledby="calendar-month" aria-describedby="calendar-help">
        <span id="calendar-month" className="sr-only">
          {formatMonth(month)}
        </span>
        <div role="row" className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              role="columnheader"
              className="py-1 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              {day}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} role="row" className="mt-1 grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              if (!day) {
                return <div key={`${weekIndex}-${dayIndex}`} role="gridcell" aria-hidden />
              }
              const isSelected = selected.includes(day)
              const isDisabled = disabled(day)
              const marked = marks.includes(day)
              return (
                <button
                  key={day}
                  id={`necrt-day-${day}`}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  tabIndex={day === tabDate ? 0 : -1}
                  onFocus={() => setFocus(day)}
                  onClick={() => onPick(day)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft") {
                      event.preventDefault()
                      move(day, -1)
                    } else if (event.key === "ArrowRight") {
                      event.preventDefault()
                      move(day, 1)
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault()
                      move(day, -7)
                    } else if (event.key === "ArrowDown") {
                      event.preventDefault()
                      move(day, 7)
                    } else if (event.key === "Home") {
                      event.preventDefault()
                      const date = parseIso(day)
                      const mondayOffset = (date.getUTCDay() + 6) % 7
                      move(day, -mondayOffset)
                    } else if (event.key === "End") {
                      event.preventDefault()
                      const date = parseIso(day)
                      const mondayOffset = (date.getUTCDay() + 6) % 7
                      move(day, 6 - mondayOffset)
                    }
                  }}
                  aria-label={`${formatLong(day)}${isWeekend(day) ? ", weekend" : ""}${isDisabled ? ", unavailable" : ""}${isSelected ? ", selected" : ""}${marked ? ", already has a request" : ""}`}
                  className={cn(
                    "relative flex aspect-square min-h-11 items-center justify-center rounded-2xl text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring disabled:cursor-not-allowed",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-paper text-foreground hover:bg-muted",
                    isDisabled && !isSelected && "bg-transparent text-muted-foreground/50",
                  )}
                >
                  {parseIso(day).getUTCDate()}
                  {marked ? (
                    <span
                      className={cn(
                        "absolute bottom-1.5 size-1.5 rounded-full",
                        isSelected ? "bg-cream" : "bg-clay",
                      )}
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
