import type { BusinessHoursDay } from "@/types"

const DAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export interface StoreOpenStatus {
  isOpen: boolean
  label: string | null
}

function currentTimeString(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

export function getStoreOpenStatus(businessHours: BusinessHoursDay[] | null): StoreOpenStatus | null {
  if (!businessHours || businessHours.length === 0) return null

  const now = new Date()
  const today = businessHours.find((day) => day.dayOfWeek === now.getDay())
  if (!today || today.isClosed || !today.opensAt || !today.closesAt) {
    return { isOpen: false, label: null }
  }

  const nowTime = currentTimeString(now)

  if (nowTime < today.opensAt) {
    return { isOpen: false, label: `Abre às ${today.opensAt}` }
  }

  if (nowTime >= today.closesAt) {
    return { isOpen: false, label: null }
  }

  return { isOpen: true, label: `Fecha às ${today.closesAt}` }
}

export function formatBusinessHoursList(businessHours: BusinessHoursDay[] | null): string[] {
  if (!businessHours || businessHours.length === 0) return []

  return [...businessHours]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((day) => {
      const label = DAY_LABELS[day.dayOfWeek] ?? ""
      if (day.isClosed || !day.opensAt || !day.closesAt) {
        return `${label}: Fechado`
      }
      return `${label}: ${day.opensAt}–${day.closesAt}`
    })
}
