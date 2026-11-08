import { createContext } from "react"
import type { CustomerTourStep } from "@/tour/customerTourSteps"

export interface CustomerTourContextValue {
  // Tour em andamento (camada escura, recorte e balão).
  active: boolean
  steps: CustomerTourStep[]
  index: number
  startTour: () => void
  stopTour: (status: "dismissed" | "completed") => void
  next: () => void
  back: () => void
  // Convite flutuante "Primeira vez pedindo por aqui?".
  inviteVisible: boolean
  dismissInvite: () => void
}

export const CustomerTourContext = createContext<CustomerTourContextValue | null>(null)
