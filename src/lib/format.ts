import type { Crt, Opening, Portion } from "@/lib/types"
import { parseIso } from "@/lib/dates"

export function fullName(person: Pick<Crt, "firstName" | "lastName">) {
  return `${person.firstName} ${person.lastName}`
}

export function portionLabel(portion: Portion) {
  if (portion === "am") return "Morning"
  if (portion === "pm") return "Afternoon"
  return "Full day"
}

export function portionShort(portion: Portion) {
  if (portion === "am") return "AM"
  if (portion === "pm") return "PM"
  return "Full"
}

const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function formatLong(value: string) {
  const date = parseIso(value)
  return `${WEEKDAYS_LONG[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS_LONG[date.getUTCMonth()]}`
}

export function formatShort(value: string) {
  const date = parseIso(value)
  return `${WEEKDAYS_SHORT[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS_SHORT[date.getUTCMonth()]}`
}

export function formatMonth(month: Date) {
  return `${MONTHS_LONG[month.getUTCMonth()]} ${month.getUTCFullYear()}`
}

export function describeWhen(opening: Opening) {
  if (opening.mode === "block" && opening.blockStart && opening.blockEnd) {
    return `${formatShort(opening.blockStart)} – ${formatShort(opening.blockEnd)} · ${portionLabel(opening.blockPortion ?? "full")} · ${opening.slots.length} school days`
  }
  if (opening.slots.length === 1) {
    const slot = opening.slots[0]
    return `${formatLong(slot.date)} · ${portionLabel(slot.portion)}`
  }
  return opening.slots
    .map((slot) => `${formatShort(slot.date)} (${portionShort(slot.portion)})`)
    .join(", ")
}

export function statusLabel(status: Opening["status"] | "pending" | "confirmed" | "passed") {
  switch (status) {
    case "open":
      return "Open"
    case "filled":
      return "Filled"
    case "withdrawn":
      return "Withdrawn"
    case "pending":
      return "Waiting on the school"
    case "confirmed":
      return "Confirmed"
    case "passed":
      return "Not taken up"
    default:
      return status
  }
}
