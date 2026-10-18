"use client"

import { Portrait } from "@/components/portrait"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fileToPortrait } from "@/lib/photo"
import { useNeCrt } from "@/lib/store"
import { SPECIALTIES } from "@/lib/types"
import { cn } from "cn"
import { toast } from "sonner"

export default function ProfilePage() {
  const store = useNeCrt()
  if (!store.ready) return null
  const desk = store
  const person = desk.crt

  async function onPhoto(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file")
      return
    }
    const photo = await fileToPortrait(file)
    if (!photo) {
      toast.error("Couldn’t read that photo")
      return
    }
    desk.updateCrt({ photo })
    toast.success("Photo updated")
  }

  return (
    <div className="max-w-3xl">
      <p className="text-sm font-medium tracking-wide text-clay-deep uppercase">You</p>
      <h1 className="mt-1 font-display text-4xl sm:text-5xl">Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Schools on your list can open this. VIT, WWCC and the photo are what they look for first. Changes stay in this
        browser.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Portrait look={person.look} photo={person.photo} className="size-28" />
        <div className="flex flex-wrap gap-2">
          <Label
            htmlFor="photo"
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-primary px-4 text-primary-foreground"
          >
            Upload photo
          </Label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              void onPhoto(file)
              event.target.value = ""
            }}
          />
          {person.photo ? (
            <Button type="button" variant="outline" size="lg" onClick={() => desk.updateCrt({ photo: "" })}>
              Remove photo
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field label="First name" value={person.firstName} onChange={(firstName) => desk.updateCrt({ firstName })} />
        <Field label="Last name" value={person.lastName} onChange={(lastName) => desk.updateCrt({ lastName })} />
        <Field label="Town" value={person.town} onChange={(town) => desk.updateCrt({ town })} />
        <Field label="Phone" value={person.phone} onChange={(phone) => desk.updateCrt({ phone })} />
        <Field label="Email" value={person.email} onChange={(email) => desk.updateCrt({ email })} type="email" />
        <Field
          label="Years teaching"
          value={String(person.years)}
          onChange={(value) => desk.updateCrt({ years: Number(value) || 0 })}
          type="number"
        />
        <Field label="VIT number" value={person.vit} onChange={(vit) => desk.updateCrt({ vit })} />
        <div>
          <Label htmlFor="vit-expiry">VIT expiry</Label>
          <Input
            id="vit-expiry"
            type="date"
            value={person.vitExpiry}
            onChange={(event) => desk.updateCrt({ vitExpiry: event.target.value })}
            className="mt-1 h-11 text-base"
          />
        </div>
        <Field label="Working with Children Check" value={person.wwcc} onChange={(wwcc) => desk.updateCrt({ wwcc })} />
      </div>

      <section className="mt-8" aria-labelledby="schools-heading">
        <h2 id="schools-heading" className="font-display text-3xl">
          Schools you’ll take
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">You only see days from schools you switch on.</p>
        <ul className="mt-4 space-y-2">
          {desk.state.schools.map((school) => {
            const on = person.schoolIds.includes(school.id)
            return (
              <li key={school.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => desk.toggleCrtSchool(school.id)}
                  className={cn(
                    "flex w-full min-h-16 items-center justify-between rounded-3xl border px-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                  )}
                >
                  <span>
                    <span className="block font-medium">{school.name}</span>
                    <span className={cn("text-sm", on ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {school.town} · {school.sector}
                    </span>
                  </span>
                  <span className="text-sm font-medium">{on ? "On your list" : "Off"}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="specialties-heading">
        <h2 id="specialties-heading" className="font-display text-3xl">
          What you cover
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {SPECIALTIES.map((specialty) => {
            const on = person.specialties.includes(specialty)
            return (
              <li key={specialty}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    const specialties = on
                      ? person.specialties.filter((item) => item !== specialty)
                      : [...person.specialties, specialty]
                    desk.updateCrt({ specialties })
                  }}
                  className={cn(
                    "min-h-11 rounded-full border px-4 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                  )}
                >
                  {specialty}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <div>
          <Label htmlFor="bio">Short bio</Label>
          <Textarea
            id="bio"
            value={person.bio}
            onChange={(event) => desk.updateCrt({ bio: event.target.value })}
            className="mt-1 min-h-28 text-base"
          />
        </div>
        <div>
          <Label htmlFor="quals">Qualifications, one per line</Label>
          <Textarea
            id="quals"
            value={person.qualifications.join("\n")}
            onChange={(event) => desk.updateCrt({ qualifications: event.target.value.split("\n") })}
            className="mt-1 min-h-28 text-base"
          />
        </div>
        <div>
          <Label htmlFor="checks">Checks, one per line</Label>
          <Textarea
            id="checks"
            value={person.checks.join("\n")}
            onChange={(event) => desk.updateCrt({ checks: event.target.value.split("\n") })}
            className="mt-1 min-h-24 text-base"
          />
        </div>
      </section>

      <section className="mt-8" aria-labelledby="experience-heading">
        <h2 id="experience-heading" className="font-display text-3xl">
          Experience
        </h2>
        <ul className="mt-4 space-y-4">
          {person.experience.map((job, index) => (
            <li key={job.id} className="space-y-2 rounded-3xl border border-border bg-card p-4">
              <Field
                id={`role-${job.id}`}
                label="Role"
                value={job.role}
                onChange={(role) => {
                  const experience = person.experience.map((item) => (item.id === job.id ? { ...item, role } : item))
                  desk.updateCrt({ experience })
                }}
              />
              <Field
                id={`org-${job.id}`}
                label="School or organisation"
                value={job.org}
                onChange={(org) => {
                  const experience = person.experience.map((item) => (item.id === job.id ? { ...item, org } : item))
                  desk.updateCrt({ experience })
                }}
              />
              <Field
                id={`span-${job.id}`}
                label="Years"
                value={job.span}
                onChange={(span) => {
                  const experience = person.experience.map((item) => (item.id === job.id ? { ...item, span } : item))
                  desk.updateCrt({ experience })
                }}
              />
              <div>
                <Label htmlFor={`detail-${job.id}`}>What you did</Label>
                <Textarea
                  id={`detail-${job.id}`}
                  value={job.detail}
                  onChange={(event) => {
                    const experience = person.experience.map((item) =>
                      item.id === job.id ? { ...item, detail: event.target.value } : item,
                    )
                    desk.updateCrt({ experience })
                  }}
                  className="mt-1 min-h-20 text-base"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() =>
                  desk.updateCrt({ experience: person.experience.filter((item) => item.id !== job.id) })
                }
              >
                Remove role {index + 1}
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="lg"
          className="mt-4"
          onClick={() =>
            desk.updateCrt({
              experience: [
                ...person.experience,
                { id: crypto.randomUUID(), role: "CRT", org: "", span: "", detail: "" },
              ],
            })
          }
        >
          Add a role
        </Button>
      </section>
    </div>
  )
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
}: {
  label: string
  id?: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  const fieldId = id ?? `profile-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
  return (
    <div>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 text-base"
      />
    </div>
  )
}
