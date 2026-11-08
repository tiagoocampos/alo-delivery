import type { BusinessHoursDay } from "@/types"

const DAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const DAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const DAY_ON = ["no domingo", "na segunda", "na terça", "na quarta", "na quinta", "na sexta", "no sábado"]
// Semana começando na segunda, para agrupar "Seg a Sáb" e deixar o domingo por último.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export interface StoreOpenStatus {
  isOpen: boolean
  // "fecha às 22:00" / "abre às 18:00" / "abre amanhã às 18:00" — sem prefixo de estado.
  label: string | null
}

function currentTimeString(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

// "07:30" -> "7:30"
function shortTime(time: string): string {
  return time.replace(/^0/, "")
}

function isOpenDay(day: BusinessHoursDay | undefined): day is BusinessHoursDay & { opensAt: string; closesAt: string } {
  return Boolean(day && !day.isClosed && day.opensAt && day.closesAt)
}

// Próxima abertura nos 7 dias seguintes (hoje já foi tratado por quem chama).
function nextOpeningLabel(businessHours: BusinessHoursDay[], today: number): string | null {
  for (let offset = 1; offset <= 7; offset++) {
    const weekday = (today + offset) % 7
    const day = businessHours.find((entry) => entry.dayOfWeek === weekday)

    if (isOpenDay(day)) {
      const when = offset === 1 ? "amanhã" : DAY_ON[weekday]
      return `abre ${when} às ${shortTime(day.opensAt)}`
    }
  }

  return null
}

export function getStoreOpenStatus(businessHours: BusinessHoursDay[] | null): StoreOpenStatus | null {
  if (!businessHours || businessHours.length === 0) return null

  const now = new Date()
  const today = businessHours.find((day) => day.dayOfWeek === now.getDay())

  if (!isOpenDay(today)) {
    return { isOpen: false, label: nextOpeningLabel(businessHours, now.getDay()) }
  }

  const nowTime = currentTimeString(now)

  if (nowTime < today.opensAt) {
    return { isOpen: false, label: `abre às ${shortTime(today.opensAt)}` }
  }

  if (nowTime >= today.closesAt) {
    return { isOpen: false, label: nextOpeningLabel(businessHours, now.getDay()) }
  }

  return { isOpen: true, label: `fecha às ${shortTime(today.closesAt)}` }
}

export function formatOpenStatus(status: StoreOpenStatus): string {
  const state = status.isOpen ? "Aberto" : "Fechado"
  return status.label ? `${state} · ${status.label}` : state
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

// Resumo de uma linha, agrupando dias seguidos com o mesmo horário:
// "Seg a Sáb · 7:30 às 22:00 · Dom · 8:00 às 14:00". Devolve null se não houver
// horário de funcionamento ou se a semana for variada demais para caber numa linha.
export function formatBusinessHoursSummary(businessHours: BusinessHoursDay[] | null): string | null {
  if (!businessHours || businessHours.length === 0) return null

  const runs: { first: number; last: number; hours: string }[] = []

  for (const weekday of WEEK_ORDER) {
    const day = businessHours.find((entry) => entry.dayOfWeek === weekday)
    if (!isOpenDay(day)) continue

    const hours = `${shortTime(day.opensAt)} às ${shortTime(day.closesAt)}`
    const previous = runs[runs.length - 1]
    const previousWeekday = previous ? WEEK_ORDER[previous.last] : undefined
    const index = WEEK_ORDER.indexOf(weekday)

    if (previous && previous.hours === hours && previous.last === index - 1 && previousWeekday !== undefined) {
      previous.last = index
    } else {
      runs.push({ first: index, last: index, hours })
    }
  }

  if (runs.length === 0 || runs.length > 3) return null

  return runs
    .map(({ first, last, hours }) => {
      const firstLabel = DAY_SHORT[WEEK_ORDER[first]!]
      const lastLabel = DAY_SHORT[WEEK_ORDER[last]!]
      const days = first === last ? firstLabel : `${firstLabel} a ${lastLabel}`
      return `${days} · ${hours}`
    })
    .join(" · ")
}
