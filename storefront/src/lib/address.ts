import type { Address } from "@/types"

export function formatAddressLine(address: Address): string {
  const parts = [
    `${address.street}, ${address.number}`,
    address.complement || null,
    address.neighborhood || null,
    address.city || null,
  ].filter(Boolean)

  return parts.join(" - ")
}
