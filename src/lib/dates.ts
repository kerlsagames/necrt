export function iso(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function parseIso(value: string) {
  return new Date(`${value}T12:00:00Z`)
}

export function addDays(value: string, amount: number) {
  const date = parseIso(value)
  date.setUTCDate(date.getUTCDate() + amount)
  return iso(date)
}

export function isWeekend(value: string) {
  const day = parseIso(value).getUTCDay()
  return day === 0 || day === 6
}

export function isPastDay(value: string, today: string) {
  return value < today
}

export function isSchoolDay(value: string, today: string) {
  return !isWeekend(value) && !isPastDay(value, today)
}

export function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12))
}

export function addMonths(date: Date, amount: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1, 12))
}

export function upcomingWeekdays(count: number, from = new Date()) {
  const days: string[] = []
  const cursor = new Date(from)
  while (days.length < count) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    const value = iso(cursor)
    if (!isWeekend(value)) days.push(value)
  }
  return days
}

export function schoolDaysBetween(start: string, end: string) {
  if (!start || !end || end < start) return []
  const days: string[] = []
  let cursor = start
  let guard = 0
  while (cursor <= end && guard < 90) {
    if (!isWeekend(cursor)) days.push(cursor)
    cursor = addDays(cursor, 1)
    guard += 1
  }
  return days
}

export function monthGrid(month: Date) {
  const year = month.getUTCFullYear()
  const monthIndex = month.getUTCMonth()
  const first = new Date(Date.UTC(year, monthIndex, 1))
  const lead = (first.getUTCDay() + 6) % 7
  const count = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const cells: (string | null)[] = []
  for (let index = 0; index < lead; index += 1) cells.push(null)
  for (let day = 1; day <= count; day += 1) {
    cells.push(iso(new Date(Date.UTC(year, monthIndex, day, 12))))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (string | null)[][] = []
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7))
  }
  return weeks
}
