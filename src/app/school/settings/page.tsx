"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNeCrt } from "@/lib/store"

export default function SettingsPage() {
  const store = useNeCrt()
  if (!store.ready) return null
  const desk = store
  const school = desk.school

  function move(index: number, direction: -1 | 1) {
    const grades = [...school.grades]
    const next = index + direction
    if (next < 0 || next >= grades.length) return
    const [item] = grades.splice(index, 1)
    grades.splice(next, 0, item)
    desk.updateSchool({ grades })
  }

  return (
    <div className="max-w-3xl">
      <p className="text-sm font-medium tracking-wide text-moss uppercase">Setup</p>
      <h1 className="mt-1 font-display text-4xl sm:text-5xl">School settings</h1>
      <p className="mt-2 text-muted-foreground">
        Year levels here are what you can pick when you request a CRT. Changes stay in this browser until you reset the
        demo.
      </p>

      <section className="mt-8 space-y-4" aria-labelledby="campus-heading">
        <h2 id="campus-heading" className="font-display text-3xl">
          Campus
        </h2>
        <div>
          <Label htmlFor="school-name">Name on the desk</Label>
          <Input
            id="school-name"
            value={school.short}
            onChange={(event) => desk.updateSchool({ short: event.target.value })}
            className="mt-1 h-11 text-base"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="school-phone">Office phone</Label>
            <Input
              id="school-phone"
              value={school.phone}
              onChange={(event) => desk.updateSchool({ phone: event.target.value })}
              className="mt-1 h-11 text-base"
            />
          </div>
          <div>
            <Label htmlFor="school-email">Office email</Label>
            <Input
              id="school-email"
              type="email"
              value={school.email}
              onChange={(event) => desk.updateSchool({ email: event.target.value })}
              className="mt-1 h-11 text-base"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="school-about">About this desk</Label>
          <Textarea
            id="school-about"
            value={school.about}
            onChange={(event) => desk.updateSchool({ about: event.target.value })}
            className="mt-1 min-h-24 text-base"
          />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="grades-heading">
        <h2 id="grades-heading" className="font-display text-3xl">
          Year levels
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a composite, a specialist class, or take one off. General duties stays available on every request.
        </p>
        <ul className="mt-4 space-y-2">
          {school.grades.map((grade, index) => (
            <li key={grade.id} className="flex flex-wrap items-center gap-2">
              <Label htmlFor={`grade-${grade.id}`} className="sr-only">
                Year level {index + 1}
              </Label>
              <Input
                id={`grade-${grade.id}`}
                value={grade.label}
                onChange={(event) => {
                  const grades = school.grades.map((item) =>
                    item.id === grade.id ? { ...item, label: event.target.value } : item,
                  )
                  desk.updateSchool({ grades })
                }}
                className="h-11 max-w-xs text-base"
              />
              <Button type="button" variant="outline" size="lg" onClick={() => move(index, -1)} disabled={index === 0}>
                Up
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => move(index, 1)}
                disabled={index === school.grades.length - 1}
              >
                Down
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => desk.updateSchool({ grades: school.grades.filter((item) => item.id !== grade.id) })}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="lg"
          className="mt-4"
          onClick={() =>
            desk.updateSchool({
              grades: [...school.grades, { id: crypto.randomUUID(), label: "New year level" }],
            })
          }
        >
          Add a year level
        </Button>
      </section>

      <section className="mt-10 space-y-4" aria-labelledby="day-heading">
        <h2 id="day-heading" className="font-display text-3xl">
          The shape of a day
        </h2>
        <div>
          <Label htmlFor="day-shape">What full, morning and afternoon mean here</Label>
          <Textarea
            id="day-shape"
            value={school.dayShape}
            onChange={(event) => desk.updateSchool({ dayShape: event.target.value })}
            className="mt-1 min-h-24 text-base"
          />
        </div>
        <div>
          <Label htmlFor="crt-notes">Note CRTs see with every day</Label>
          <Textarea
            id="crt-notes"
            value={school.crtNotes}
            onChange={(event) => desk.updateSchool({ crtNotes: event.target.value })}
            className="mt-1 min-h-28 text-base"
          />
        </div>
      </section>
    </div>
  )
}
