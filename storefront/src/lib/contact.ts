import { toInternationalPhone } from "@/lib/phone"

const WHATSAPP_GREETING = "Olá! Vim pelo cardápio digital e gostaria de fazer um pedido."

// null quando a loja não tem telefone utilizável — quem chama oculta o botão.
export function whatsappUrl(phone: string | null | undefined): string | null {
  const international = toInternationalPhone(phone)
  if (!international) return null

  return `https://wa.me/${international}?text=${encodeURIComponent(WHATSAPP_GREETING)}`
}

export function telUrl(phone: string | null | undefined): string | null {
  const international = toInternationalPhone(phone)
  return international ? `tel:+${international}` : null
}

export function mapsUrl(address: string | null | undefined): string | null {
  const trimmed = address?.trim()
  if (!trimmed) return null

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`
}
