"use client"

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react"
import { crtsWhoCanSee } from "@/lib/access"
import { schoolDaysBetween } from "@/lib/dates"
import { createSeed } from "@/lib/seed"
import type {
  AppState,
  Application,
  Audience,
  Crt,
  Opening,
  Portion,
  School,
  Slot,
} from "@/lib/types"

const STORAGE_KEY = "necrt-demo-v1"

export type OpeningDraft = {
  mode: "days" | "block"
  slots: Slot[]
  blockStart: string
  blockEnd: string
  blockPortion: Portion
  gradeId: string
  role: string
  notes: string
  audience: Audience
  selectedCrtIds: string[]
}

type ReadyStore = {
  ready: true
  state: AppState
  school: School
  crt: Crt
  favouriteIds: string[]
  hiddenIds: string[]
  crtsAtSchool: Crt[]
  schoolOpenings: Opening[]
  pending: Application[]
  setActiveSchool: (id: string) => void
  setActiveCrt: (id: string) => void
  updateSchool: (patch: Partial<School>) => void
  updateCrt: (patch: Partial<Crt>) => void
  toggleFavourite: (crtId: string) => void
  toggleHidden: (crtId: string) => void
  toggleCrtSchool: (schoolId: string) => void
  pushOpening: (draft: OpeningDraft) => { count: number }
  withdrawOpening: (openingId: string) => void
  applyToOpening: (openingId: string, note: string) => void
  withdrawApplication: (applicationId: string) => void
  confirmApplication: (applicationId: string) => void
  passApplication: (applicationId: string) => void
  resetDemo: () => void
}

type StoreValue = { ready: false } | ReadyStore

const StoreContext = createContext<StoreValue>({ ready: false })

let memory: AppState | null = null
let serverSnapshot: AppState | null = null
const listeners = new Set<() => void>()
const demoAnchor = new Date("2026-10-18T12:00:00Z")

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeed()
    const parsed = JSON.parse(raw) as AppState
    if (
      !parsed ||
      parsed.version !== 1 ||
      !parsed.today ||
      !Array.isArray(parsed.schools) ||
      !Array.isArray(parsed.crts)
    ) {
      return createSeed()
    }
    return parsed
  } catch {
    return createSeed()
  }
}

function ensure() {
  if (memory) return memory
  memory = typeof window === "undefined" ? createSeed() : loadState()
  return memory
}

function emit(next: AppState) {
  memory = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // The demo keeps going even if a photo is too large for this browser.
  }
  listeners.forEach((listener) => listener())
}

function update(recipe: (state: AppState) => AppState) {
  emit(recipe(ensure()))
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return ensure()
}

function getServerSnapshot() {
  serverSnapshot ??= createSeed(demoAnchor)
  return serverSnapshot
}

function toggleId(list: string[] | undefined, id: string) {
  const current = list ?? []
  return current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
}

function buildOpening(school: School, draft: OpeningDraft): Opening {
  const slots =
    draft.mode === "block"
      ? schoolDaysBetween(draft.blockStart, draft.blockEnd).map((date) => ({
          date,
          portion: draft.blockPortion,
        }))
      : [...draft.slots].sort((a, b) => a.date.localeCompare(b.date))
  const gradeLabel =
    draft.gradeId === "general"
      ? "General duties"
      : (school.grades.find((grade) => grade.id === draft.gradeId)?.label ?? "General duties")
  return {
    id: crypto.randomUUID(),
    schoolId: school.id,
    mode: draft.mode,
    slots,
    blockStart: draft.mode === "block" ? draft.blockStart : undefined,
    blockEnd: draft.mode === "block" ? draft.blockEnd : undefined,
    blockPortion: draft.mode === "block" ? draft.blockPortion : undefined,
    gradeId: draft.gradeId,
    gradeLabel,
    role: draft.role,
    notes: draft.notes.trim(),
    audience: draft.audience,
    selectedCrtIds: draft.audience === "selected" ? draft.selectedCrtIds : [],
    status: "open",
    createdAt: new Date().toISOString(),
  }
}

function makeValue(state: AppState): ReadyStore {
  const school = state.schools.find((item) => item.id === state.activeSchoolId) ?? state.schools[0]
  const crt = state.crts.find((person) => person.id === state.activeCrtId) ?? state.crts[0]
  return {
    ready: true,
    state,
    school,
    crt,
    favouriteIds: state.favourites[school.id] ?? [],
    hiddenIds: state.hidden[school.id] ?? [],
    crtsAtSchool: state.crts.filter((person) => person.schoolIds.includes(school.id)),
    schoolOpenings: state.openings.filter(
      (opening) => opening.schoolId === school.id && opening.status !== "withdrawn",
    ),
    pending: state.applications.filter((application) => {
      if (application.status !== "pending") return false
      const opening = state.openings.find((item) => item.id === application.openingId)
      return opening?.schoolId === school.id && opening.status === "open"
    }),
    setActiveSchool: (id) => update((current) => ({ ...current, activeSchoolId: id })),
    setActiveCrt: (id) => update((current) => ({ ...current, activeCrtId: id })),
    updateSchool: (patch) =>
      update((current) => ({
        ...current,
        schools: current.schools.map((item) =>
          item.id === current.activeSchoolId ? { ...item, ...patch } : item,
        ),
      })),
    updateCrt: (patch) =>
      update((current) => ({
        ...current,
        crts: current.crts.map((person) =>
          person.id === current.activeCrtId ? { ...person, ...patch } : person,
        ),
      })),
    toggleFavourite: (crtId) =>
      update((current) => ({
        ...current,
        favourites: {
          ...current.favourites,
          [current.activeSchoolId]: toggleId(current.favourites[current.activeSchoolId], crtId),
        },
      })),
    toggleHidden: (crtId) =>
      update((current) => ({
        ...current,
        hidden: {
          ...current.hidden,
          [current.activeSchoolId]: toggleId(current.hidden[current.activeSchoolId], crtId),
        },
      })),
    toggleCrtSchool: (schoolId) =>
      update((current) => ({
        ...current,
        crts: current.crts.map((person) => {
          if (person.id !== current.activeCrtId) return person
          const schoolIds = person.schoolIds.includes(schoolId)
            ? person.schoolIds.filter((id) => id !== schoolId)
            : [...person.schoolIds, schoolId]
          return { ...person, schoolIds }
        }),
      })),
    pushOpening: (draft) => {
      const current = ensure()
      const active = current.schools.find((item) => item.id === current.activeSchoolId) ?? current.schools[0]
      const opening = buildOpening(active, draft)
      const count = crtsWhoCanSee({ ...current, openings: [opening, ...current.openings] }, opening).length
      update((latest) => ({ ...latest, openings: [opening, ...latest.openings] }))
      return { count }
    },
    withdrawOpening: (openingId) =>
      update((current) => ({
        ...current,
        openings: current.openings.map((opening) =>
          opening.id === openingId ? { ...opening, status: "withdrawn" } : opening,
        ),
        applications: current.applications.map((application) =>
          application.openingId === openingId && application.status === "pending"
            ? { ...application, status: "withdrawn" }
            : application,
        ),
      })),
    applyToOpening: (openingId, note) =>
      update((current) => {
        const crtId = current.activeCrtId
        const opening = current.openings.find((item) => item.id === openingId)
        if (!opening || opening.status !== "open") return current
        const existing = current.applications.find(
          (application) => application.openingId === openingId && application.crtId === crtId,
        )
        if (existing?.status === "pending" || existing?.status === "confirmed") return current
        const nextNote = note.trim()
        if (existing) {
          return {
            ...current,
            applications: current.applications.map((application) =>
              application.id === existing.id
                ? { ...application, status: "pending", note: nextNote, createdAt: new Date().toISOString() }
                : application,
            ),
          }
        }
        const application: Application = {
          id: crypto.randomUUID(),
          openingId,
          crtId,
          note: nextNote,
          status: "pending",
          createdAt: new Date().toISOString(),
        }
        return { ...current, applications: [application, ...current.applications] }
      }),
    withdrawApplication: (applicationId) =>
      update((current) => ({
        ...current,
        applications: current.applications.map((application) =>
          application.id === applicationId && application.status === "pending"
            ? { ...application, status: "withdrawn" }
            : application,
        ),
      })),
    confirmApplication: (applicationId) =>
      update((current) => {
        const application = current.applications.find((item) => item.id === applicationId)
        if (!application || application.status !== "pending") return current
        const opening = current.openings.find((item) => item.id === application.openingId)
        if (!opening || opening.status !== "open") return current
        return {
          ...current,
          openings: current.openings.map((item) =>
            item.id === opening.id ? { ...item, status: "filled", filledByCrtId: application.crtId } : item,
          ),
          applications: current.applications.map((item) => {
            if (item.id === application.id) return { ...item, status: "confirmed" }
            if (item.openingId === opening.id && item.status === "pending") return { ...item, status: "passed" }
            return item
          }),
        }
      }),
    passApplication: (applicationId) =>
      update((current) => ({
        ...current,
        applications: current.applications.map((application) =>
          application.id === applicationId && application.status === "pending"
            ? { ...application, status: "passed" }
            : application,
        ),
      })),
    resetDemo: () => {
      localStorage.removeItem(STORAGE_KEY)
      emit(createSeed())
    },
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const value: StoreValue = state ? makeValue(state) : { ready: false }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useNeCrt() {
  return useContext(StoreContext)
}
