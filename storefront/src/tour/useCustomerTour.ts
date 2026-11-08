import { useContext } from "react"
import { CustomerTourContext } from "@/tour/customerTourContext"

export function useCustomerTour() {
  const context = useContext(CustomerTourContext)

  if (!context) {
    throw new Error("useCustomerTour deve ser usado dentro de um CustomerTourProvider")
  }

  return context
}
