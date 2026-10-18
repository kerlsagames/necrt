export type Portion = "full" | "am" | "pm"
export type Audience = "list" | "favourites" | "selected"
export type OpeningStatus = "open" | "filled" | "withdrawn"
export type ApplicationStatus = "pending" | "confirmed" | "passed" | "withdrawn"

export type Grade = { id: string; label: string }

export type HairStyle =
  | "crop"
  | "bob"
  | "bun"
  | "curls"
  | "long"
  | "fade"
  | "wavy"
  | "short"

export type Look = {
  skin: string
  hair: string
  shirt: string
  hairStyle: HairStyle
  glasses?: boolean
  beard?: boolean
}

export type Experience = {
  id: string
  role: string
  org: string
  span: string
  detail: string
}

export type School = {
  id: string
  name: string
  short: string
  town: string
  sector: string
  years: string
  address: string
  phone: string
  email: string
  about: string
  crtNotes: string
  dayShape: string
  grades: Grade[]
}

export type Crt = {
  id: string
  firstName: string
  lastName: string
  town: string
  phone: string
  email: string
  vit: string
  vitExpiry: string
  wwcc: string
  years: number
  specialties: string[]
  bio: string
  qualifications: string[]
  experience: Experience[]
  checks: string[]
  schoolIds: string[]
  look: Look
  photo?: string
}

export type Slot = { date: string; portion: Portion }

export type Opening = {
  id: string
  schoolId: string
  mode: "days" | "block"
  slots: Slot[]
  blockStart?: string
  blockEnd?: string
  blockPortion?: Portion
  gradeId: string
  gradeLabel: string
  role: string
  notes: string
  audience: Audience
  selectedCrtIds: string[]
  status: OpeningStatus
  filledByCrtId?: string
  createdAt: string
}

export type Application = {
  id: string
  openingId: string
  crtId: string
  note: string
  status: ApplicationStatus
  createdAt: string
}

export type AppState = {
  version: 1
  today: string
  schools: School[]
  crts: Crt[]
  openings: Opening[]
  applications: Application[]
  favourites: Record<string, string[]>
  hidden: Record<string, string[]>
  activeSchoolId: string
  activeCrtId: string
}

export const SPECIALIST_ROLES = [
  "Sport",
  "Music",
  "Art",
  "Library",
  "LOTE",
  "STEM",
  "Integration",
  "Leadership",
  "Classroom",
] as const

export const SPECIALTIES = [
  "Early years",
  "Literacy",
  "Numeracy",
  "Classroom",
  "Sport",
  "Music",
  "Art",
  "Library",
  "LOTE",
  "STEM",
  "Science",
  "Maths",
  "English",
  "Integration",
  "Leadership",
  "Outdoor ed",
] as const
