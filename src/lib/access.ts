import type { AppState, Opening } from "@/lib/types"

export function isHidden(state: AppState, schoolId: string, crtId: string) {
  return (state.hidden[schoolId] ?? []).includes(crtId)
}

export function isFavourite(state: AppState, schoolId: string, crtId: string) {
  return (state.favourites[schoolId] ?? []).includes(crtId)
}

export function crtCanSee(state: AppState, crtId: string, opening: Opening) {
  if (opening.status === "withdrawn") return false
  const crt = state.crts.find((person) => person.id === crtId)
  if (!crt || !crt.schoolIds.includes(opening.schoolId)) return false
  if (isHidden(state, opening.schoolId, crtId)) return false
  if (opening.audience === "favourites") {
    return isFavourite(state, opening.schoolId, crtId)
  }
  if (opening.audience === "selected") {
    return opening.selectedCrtIds.includes(crtId)
  }
  return true
}

export function crtsWhoCanSee(state: AppState, opening: Opening) {
  return state.crts.filter((person) => crtCanSee(state, person.id, opening))
}

export function audienceLabel(state: AppState, opening: Opening) {
  if (opening.audience === "favourites") return "Favourites only"
  if (opening.audience === "selected") {
    const names = opening.selectedCrtIds
      .map((id) => state.crts.find((person) => person.id === id)?.firstName)
      .filter(Boolean)
    return names.length > 0 ? `Chosen: ${names.join(", ")}` : "Chosen CRTs"
  }
  return "Everyone on the list"
}
